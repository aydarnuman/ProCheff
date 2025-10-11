export enum ActiveTab {
  Dashboard = 'dashboard',
  Plan = 'plan',
  Prices = 'prices',
  Recipes = 'recipes',
  AiMenuPlanner = 'aiMenuPlanner',
  SettingsIntelligence = 'settingsIntelligence',
  SettingsApi = 'settingsApi',
  SettingsGeneral = 'settingsGeneral',
}

export type PriceStatus = 'auto' | 'manual' | 'safe_mode';

export interface PriceHistoryRecord {
  date: string; // ISO 8601
  price: number | null;
  type: 'ai' | 'manual';
  source?: string; // e.g., 'Migros', 'Kullanıcı', 'Geri Alma'
}

export interface SourceInfo {
  name: string; // Store name e.g., Migros
  brand?: string; // Product brand name e.g., Pınar
  price: number; // This is the PACKAGE price found by AI.
  confidence: number;
}

export interface IngredientPrice {
  unit: string;
  price: number | null; // This is the AI/default BASE unit price
  group: string;
  packageSize?: number;
  packageUnit?: string;
  
  status: PriceStatus;
  isLocked: boolean;
  manualOverridePrice?: number | null;
  lastUpdated?: string; 

  notes?: string;
  sources?: SourceInfo[]; // REPLACES source and confidenceScore

  priceHistory?: PriceHistoryRecord[];
}


export type PriceList = Record<string, IngredientPrice>;

export interface RecipeIngredient {
  name: string;
  qty: number;
  unit: string;
  lossPercentage?: number; // Pişirme firesi oranı (%)
}

export interface Recipe {
  group: string;
  name:string;
  ingredients: RecipeIngredient[];
}

export interface PlannerRecipe {
  name: string;
  group: string;
}

export type MealSlots = {
  'Çorba': PlannerRecipe | null;
  'Ana Yemek': PlannerRecipe | null;
  'Garnitür': PlannerRecipe | null;
  'Ek / Diğer': PlannerRecipe | null;
};

export type MonthlyPlan = {
  personCount?: number;
  days?: {
    [date: string]: MealSlots;
  }
};

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
};

// --- GEMINI-SPECIFIC TYPES for Public Menu Generation ---
export type PublicIngredient = {
    name: string;
    qty: number;
    unit: 'g' | 'ml' | 'adet';
};

export type PublicRecipe = {
    mealName: string;
    ingredients: PublicIngredient[];
};

export type PublicMenu = PublicRecipe[];

// --- SETTINGS PAGE TYPES ---
export type AiSettings = {
  freshnessThreshold: 1 | 3 | 7;
  minSources: 2 | 3 | 4;
  outlierThreshold: 20 | 30 | 50;
  analysisMode: 'Normal' | 'Dikkatli' | 'Derin';
  autoUpdate: boolean;
  advanced: {
    autoRollback: boolean;
    emailOnError: boolean;
  };
};

export type ApiResourceState = 'operational' | 'degraded' | 'down';

export type ApiAuth = 
  | { type: 'none' }
  | { type: 'apiKey', key: string, value: string, in: 'header' | 'query' }
  | { type: 'oauth' }; // Simplified for now

export type ApiMappings = {
  name: string;
  price: string;
  unit: string;
  captured_at: string;
  brand: string;
  url: string;
};

export type ApiResource = {
  id: string;
  name: string;
  logo: string;
  type: 'Market' | 'Tedarikçi' | 'Resmi Kurum';
  baseUrl: string;
  healthEndpoint?: string;
  testEndpoint?: string;
  auth: ApiAuth;
  timeoutMs?: number;
  rateLimit?: number;
  weight: number;
  previousWeight?: number;
  mappings: ApiMappings;

  // Status fields
  state: ApiResourceState;
  lastSyncAt: string; // ISO date string
  lastOkAt?: string; // ISO date string
  lastErrorAt?: string; // ISO date string
  details?: string; // Last error message
  metrics?: {
    latencyMsAvg: number;
    uptime24h: number;
    lastStatusCode?: number;
  };

  // Soft delete & dependency fields
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  pendingAnalyses?: number;
};

export type AiError = {
  id: string;
  date: string; // ISO date string
  status: 'Düzeltilmiş' | 'Beklemede' | 'Onay Bekliyor' | 'İnceleniyor';
  description: string;
  type: 'ai_learning' | 'api_failure';
  details?: {
    dataId: string;
    source: string;
    oldValue: any;
    newValue: any;
  };
};

// --- AI ANALYSIS MODAL TYPES ---
export type AnalysisSummary = {
  totalCost: number;
  avgDailyCost: number;
  expensiveDay: { date: string; cost: number; };
  cheapDay: { date: string; cost: number; };
  diversityScore: number; // 0-100
  costHistory: { date: string, cost: number }[];
};

export type InstitutionalMenus = Record<string, MonthlyPlan>;

// --- AI ANALYSIS JOB MANAGER TYPES ---
export type AnalysisScope = {
  institution: string;
  year: number;
  month: number;
};

export type AiAnalysisJob = {
  key: string;
  scope: AnalysisScope;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: AnalysisSummary;
  error?: string;
  retries: number;
};

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type AiAnalysisState = {
  jobs: AiAnalysisJob[];
  history: AiAnalysisJob[];
  cache: Record<string, { summary: AnalysisSummary; timestamp: number }>;
  cooldowns: Record<string, number>; // key -> expiresAt timestamp
  circuitBreaker: {
    state: CircuitBreakerState;
    openUntil: number;
    failures: { timestamp: number }[];
  };
};