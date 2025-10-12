

import { useState, useEffect, useRef, useCallback } from 'react';
import { AiAnalysisState, AnalysisScope, AiAnalysisJob, AnalysisSummary, PriceList, Recipe, MonthlyPlan } from '../types';
import useLocalStorage from './useLocalStorage';
import { performGeminiAnalysis } from '../utils/analysis';

// --- CONSTANTS from user spec ---
const COOLDOWN_SECONDS = 60;
const GLOBAL_RATE_LIMIT_JOBS = 4;
const GLOBAL_RATE_LIMIT_MINUTES = 1;
const JOB_TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;
const BACKOFF_SCHEDULE = [2000, 4000, 8000]; // in ms

const BREAKER_WINDOW_MINUTES = 10;
const BREAKER_FAILURE_THRESHOLD = 3; // Rate limit failures
const BREAKER_OPEN_MINUTES = 15;

const generateJobKey = (scope: AnalysisScope) => `${scope.institution}|${scope.year}-${scope.month}`;

const useAiAnalysisManager = (recipes: Recipe[], priceList: PriceList) => {
    const [state, setState] = useLocalStorage<AiAnalysisState>('degsan_ai_analysis_manager', {
        jobs: [],
        history: [],
        cache: {},
        cooldowns: {},
        circuitBreaker: { state: 'CLOSED', openUntil: 0, failures: [] },
    });
    
    // Non-persistent state
    const [isProcessing, setIsProcessing] = useState(false);
    const activeJobPromise = useRef<Promise<AnalysisSummary> | null>(null);
    const activeJobKey = useRef<string | null>(null);

    const updateState = (updater: (prevState: AiAnalysisState) => AiAnalysisState) => {
        setState(updater);
    };
    
    // --- JOB EXECUTION ---
    const executeJob = useCallback(async (job: AiAnalysisJob, monthlyPlan: MonthlyPlan) => {
        activeJobKey.current = job.key;

        const runWithRetries = async (attempt: number): Promise<AnalysisSummary> => {
            updateState(s => ({ ...s, jobs: s.jobs.map(j => j.key === job.key ? { ...j, retries: attempt } : j) }));
            
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error(`İşlem ${JOB_TIMEOUT_MS / 1000} saniyede zaman aşımına uğradı.`)), JOB_TIMEOUT_MS)
            );

            try {
                return await Promise.race([
                    performGeminiAnalysis(job.scope, recipes, priceList, monthlyPlan),
                    timeoutPromise
                ]);
            } catch (error) {
                const isRateLimit = error instanceof Error && error.message.includes("Rate limit exceeded");
                
                // Record failure for circuit breaker
                updateState(s => {
                    const now = Date.now();
                    const relevantFailures = s.circuitBreaker.failures.filter(f => now - f.timestamp < BREAKER_WINDOW_MINUTES * 60 * 1000);
                    return {
                        ...s,
                        circuitBreaker: { ...s.circuitBreaker, failures: [...relevantFailures, { timestamp: now }] }
                    };
                });
                
                if (isRateLimit && attempt < MAX_RETRIES) {
                    const backoff = BACKOFF_SCHEDULE[attempt] + (Math.random() - 0.5) * BACKOFF_SCHEDULE[attempt] * 0.4; // +/- 20% jitter
                    await new Promise(res => setTimeout(res, backoff));
                    return runWithRetries(attempt + 1);
                }
                throw error;
            }
        };

        try {
            const result = await runWithRetries(0);
            updateState(s => {
                const now = Date.now();
                const completedJob: AiAnalysisJob = {
                    ...job,
                    status: 'completed',
                    result,
                    completedAt: now
                };
                const newHistory = [completedJob, ...s.history].slice(0, 20);
                const newCache = { ...s.cache, [job.key]: { summary: result, timestamp: now } };
                return {
                    ...s,
                    history: newHistory,
                    cache: newCache,
                    jobs: s.jobs.filter(j => j.key !== job.key),
                    circuitBreaker: { ...s.circuitBreaker, state: 'CLOSED', failures: [] } // Success resets failures
                };
            });
            return result;
        } catch (error) {
            updateState(s => {
                const now = Date.now();
                const errorMessage = error instanceof Error ? error.message : "Bilinmeyen analiz hatası.";
                const failedJob: AiAnalysisJob = {
                    ...job,
                    status: 'failed',
                    error: errorMessage,
                    completedAt: now
                };
                const newHistory = [failedJob, ...s.history].slice(0, 20);
                return { ...s, history: newHistory, jobs: s.jobs.filter(j => j.key !== job.key) };
            });
            throw error;
        } finally {
            activeJobKey.current = null;
        }
    }, [recipes, priceList, setState]);


    // --- QUEUE PROCESSING ---
    const processQueue = useCallback(async (currentPlan: MonthlyPlan) => {
        if (isProcessing || state.jobs.length === 0) return;
        
        const jobToRun = state.jobs.find(j => j.status === 'queued');
        if (!jobToRun) return;

        setIsProcessing(true);
        updateState(s => ({ ...s, jobs: s.jobs.map(j => j.key === jobToRun.key ? { ...j, status: 'running', startedAt: Date.now() } : j) }));

        const promise = executeJob(jobToRun, currentPlan);
        activeJobPromise.current = promise;
        
        try {
            await promise;
        } catch (e) {
            // Error is handled inside executeJob
        } finally {
            setIsProcessing(false);
            activeJobPromise.current = null;
        }
    }, [isProcessing, state.jobs, executeJob, updateState]);
    
    // Effect to trigger queue processing
    useEffect(() => {
        // This effect needs the most current monthlyPlan, but we can't pass it in.
        // The plan will be passed when `requestAnalysis` is called.
        // We just check if we should start processing.
        if (!isProcessing && state.jobs.some(j => j.status === 'queued')) {
            // Cannot start processing here without the plan.
            // The call to processQueue must come from requestAnalysis.
        }
    }, [state.jobs, isProcessing]);


    // --- CIRCUIT BREAKER LOGIC ---
    useEffect(() => {
        const now = Date.now();
        const { state: currentState, failures, openUntil } = state.circuitBreaker;

        if (currentState === 'OPEN' && now > openUntil) {
            // When breaker time is up, move to HALF_OPEN (or just CLOSED for simplicity)
            updateState(s => ({ ...s, circuitBreaker: { ...s.circuitBreaker, state: 'CLOSED' } }));
        } else if (currentState === 'CLOSED') {
            const relevantFailures = failures.filter(f => now - f.timestamp < BREAKER_WINDOW_MINUTES * 60 * 1000);
            if (relevantFailures.length >= BREAKER_FAILURE_THRESHOLD) {
                updateState(s => ({
                    ...s,
                    circuitBreaker: {
                        ...s.circuitBreaker,
                        state: 'OPEN',
                        openUntil: now + BREAKER_OPEN_MINUTES * 60 * 1000,
                        failures: relevantFailures // Keep relevant failures
                    }
                }));
            } else if (failures.length !== relevantFailures.length) {
                // Prune old failures
                updateState(s => ({...s, circuitBreaker: {...s.circuitBreaker, failures: relevantFailures }}));
            }
        }
    }, [state.circuitBreaker, updateState]);


    // --- PUBLIC API ---
    const requestAnalysis = useCallback((scope: AnalysisScope, monthlyPlan: MonthlyPlan): Promise<AnalysisSummary> => {
        return new Promise((resolve, reject) => {
            const key = generateJobKey(scope);
            const now = Date.now();

            // 1. Check Circuit Breaker
            if (state.circuitBreaker.state === 'OPEN' && now < state.circuitBreaker.openUntil) {
                const timeLeft = Math.ceil((state.circuitBreaker.openUntil - now) / 60000);
                return reject(new Error(`Sistem yoğun, analiz geçici olarak durduruldu. Lütfen ${timeLeft} dk sonra tekrar deneyin.`));
            }
            
            // 2. Check Cooldown
            if (state.cooldowns[key] && now < state.cooldowns[key]) {
                return reject(new Error(`Bu analiz için ${COOLDOWN_SECONDS} sn beklemelisiniz.`));
            }

            // 3. Coalesce: Check if same job is active or queued
            if (activeJobKey.current === key && activeJobPromise.current) {
                return resolve(activeJobPromise.current);
            }
            const queuedJob = state.jobs.find(j => j.key === key);
            if(queuedJob) {
                // This is tricky without a proper event emitter. For now, we just let it be.
                // The user will see it in the queue. A better implementation would attach this resolve/reject
                // to the existing job's promise.
                return reject(new Error("Analiz zaten kuyrukta."));
            }

            // 4. Check Global Rate Limit
            const oneMinuteAgo = now - GLOBAL_RATE_LIMIT_MINUTES * 60 * 1000;
            const recentJobs = state.history.filter(j => (j.startedAt || 0) > oneMinuteAgo);
            if (recentJobs.length >= GLOBAL_RATE_LIMIT_JOBS) {
                 return reject(new Error(`Global analiz limiti (${GLOBAL_RATE_LIMIT_JOBS}/dk) aşıldı. Lütfen daha sonra deneyin.`));
            }
            
            // 5. Create and Queue Job
            const newJob: AiAnalysisJob = {
                key,
                scope,
                status: 'queued',
                createdAt: now,
                retries: 0,
            };

            updateState(s => ({
                ...s,
                jobs: [...s.jobs, newJob],
                cooldowns: { ...s.cooldowns, [key]: now + COOLDOWN_SECONDS * 1000 },
            }));

            // IMPORTANT: Trigger queue processing with the current monthly plan
            // Use a timeout to allow state to update before processing
            setTimeout(() => processQueue(monthlyPlan), 0);
        });
    }, [state, updateState, processQueue]);

    return { state, requestAnalysis };
};

export default useAiAnalysisManager;