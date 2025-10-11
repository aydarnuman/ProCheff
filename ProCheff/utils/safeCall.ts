
export type SafeCallResult<T> = 
  | { ok: true; data: T } 
  | { ok: false; error: string };

export interface SafeCallOptions {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Wraps an asynchronous function call with timeout, retry, and error handling.
 * @param fn The asynchronous function to execute.
 * @param options Configuration for timeout and retries.
 * @returns A result object indicating success or failure.
 */
export async function safeCall<T>(
  fn: () => Promise<T>,
  options: SafeCallOptions = {}
): Promise<SafeCallResult<T>> {
  const { timeoutMs = 8000, retries = 1 } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`İşlem ${timeoutMs / 1000} saniyede zaman aşımına uğradı.`)), timeoutMs)
      );
      
      const result = await Promise.race([fn(), timeoutPromise]);
      
      return { ok: true, data: result };

    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Bilinmeyen bir hata oluştu.');
      console.warn(`Attempt ${attempt + 1} failed: ${lastError.message}`);
      
      // Don't wait after the last attempt
      if (attempt < retries) {
        // Optional: Add a small delay before retrying
        await new Promise(res => setTimeout(res, 250 * (attempt + 1)));
      }
    }
  }

  return { 
    ok: false, 
    error: lastError ? lastError.message : 'Maksimum deneme sayısına ulaşıldı.' 
  };
}
