// Maliyet simülatörü için veri modeli ve reducer

export interface CostIngredient {
  id: string
  name: string
  category: string
  unit: string
  unitPrice: number
  quantity: number
  totalCost: number
  supplier: string
  quality: 'premium' | 'standard' | 'economy'
  seasonal: boolean
  lastUpdate: Date
  notes?: string
}

export interface CostSimulation {
  id: string
  name: string
  description: string
  ingredients: CostIngredient[]
  servings: number
  costPerServing: number
  totalCost: number
  profitMargin: number
  sellingPrice: number
  finalPrice: number
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface CostSimulatorState {
  simulations: CostSimulation[]
  currentSimulation: CostSimulation | null
  availableIngredients: CostIngredient[]
  isLoading: boolean
  error: string | null
  filters: {
    category: string | null
    priceRange: {
      min: number | null
      max: number | null
    }
  }
}

export type CostSimulatorAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_SIMULATION'; payload: CostSimulation }
  | { type: 'UPDATE_SIMULATION'; payload: { id: string; updates: Partial<CostSimulation> } }
  | { type: 'DELETE_SIMULATION'; payload: string }
  | { type: 'SET_CURRENT_SIMULATION'; payload: string | null }
  | { type: 'ADD_INGREDIENT_TO_SIMULATION'; payload: { simulationId: string; ingredient: CostIngredient } }
  | { type: 'UPDATE_INGREDIENT_IN_SIMULATION'; payload: { simulationId: string; ingredientId: string; updates: Partial<CostIngredient> } }
  | { type: 'REMOVE_INGREDIENT_FROM_SIMULATION'; payload: { simulationId: string; ingredientId: string } }
  | { type: 'SET_AVAILABLE_INGREDIENTS'; payload: CostIngredient[] }
  | { type: 'UPDATE_FILTERS'; payload: Partial<CostSimulatorState['filters']> }
  | { type: 'CALCULATE_SIMULATION_COSTS'; payload: string }

export const initialCostSimulatorState: CostSimulatorState = {
  simulations: [],
  currentSimulation: null,
  availableIngredients: [],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    priceRange: { min: null, max: null }
  }
}

export function costSimulatorReducer(
  state: CostSimulatorState,
  action: CostSimulatorAction
): CostSimulatorState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'ADD_SIMULATION':
      return {
        ...state,
        simulations: [...state.simulations, action.payload]
      }

    case 'UPDATE_SIMULATION':
      return {
        ...state,
        simulations: state.simulations.map(sim =>
          sim.id === action.payload.id
            ? { ...sim, ...action.payload.updates, updatedAt: new Date() }
            : sim
        ),
        currentSimulation: state.currentSimulation?.id === action.payload.id
          ? { ...state.currentSimulation, ...action.payload.updates, updatedAt: new Date() }
          : state.currentSimulation
      }

    case 'DELETE_SIMULATION':
      return {
        ...state,
        simulations: state.simulations.filter(sim => sim.id !== action.payload),
        currentSimulation: state.currentSimulation?.id === action.payload ? null : state.currentSimulation
      }

    case 'SET_CURRENT_SIMULATION':
      return { 
        ...state, 
        currentSimulation: action.payload 
          ? state.simulations.find(sim => sim.id === action.payload) || null 
          : null 
      }

    case 'ADD_INGREDIENT_TO_SIMULATION': {
      const { simulationId, ingredient } = action.payload
      return {
        ...state,
        simulations: state.simulations.map(sim =>
          sim.id === simulationId
            ? { ...sim, ingredients: [...sim.ingredients, ingredient] }
            : sim
        ),
        currentSimulation: state.currentSimulation?.id === simulationId
          ? { ...state.currentSimulation, ingredients: [...state.currentSimulation.ingredients, ingredient] }
          : state.currentSimulation
      }
    }

    case 'UPDATE_INGREDIENT_IN_SIMULATION': {
      const { simulationId, ingredientId, updates } = action.payload
      return {
        ...state,
        simulations: state.simulations.map(sim =>
          sim.id === simulationId
            ? {
                ...sim,
                ingredients: sim.ingredients.map(ing =>
                  ing.id === ingredientId ? { ...ing, ...updates } : ing
                )
              }
            : sim
        ),
        currentSimulation: state.currentSimulation?.id === simulationId
          ? {
              ...state.currentSimulation,
              ingredients: state.currentSimulation.ingredients.map(ing =>
                ing.id === ingredientId ? { ...ing, ...updates } : ing
              )
            }
          : state.currentSimulation
      }
    }

    case 'REMOVE_INGREDIENT_FROM_SIMULATION': {
      const { simulationId, ingredientId } = action.payload
      return {
        ...state,
        simulations: state.simulations.map(sim =>
          sim.id === simulationId
            ? { ...sim, ingredients: sim.ingredients.filter(ing => ing.id !== ingredientId) }
            : sim
        ),
        currentSimulation: state.currentSimulation?.id === simulationId
          ? {
              ...state.currentSimulation,
              ingredients: state.currentSimulation.ingredients.filter(ing => ing.id !== ingredientId)
            }
          : state.currentSimulation
      }
    }

    case 'SET_AVAILABLE_INGREDIENTS':
      return { ...state, availableIngredients: action.payload }

    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }

    case 'CALCULATE_SIMULATION_COSTS': {
      const simulationId = action.payload
      const updateCosts = (sim: CostSimulation) => {
        if (sim.id !== simulationId) return sim

        const totalCost = sim.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
        const costPerServing = sim.servings > 0 ? totalCost / sim.servings : 0
        const sellingPrice = costPerServing * (1 + sim.profitMargin / 100)

        return {
          ...sim,
          totalCost,
          costPerServing,
          sellingPrice,
          updatedAt: new Date()
        }
      }

      return {
        ...state,
        simulations: state.simulations.map(updateCosts),
        currentSimulation: state.currentSimulation ? updateCosts(state.currentSimulation) : null
      }
    }

    default:
      return state
  }
}

// Utility functions
export function calculateIngredientTotalCost(ingredient: Partial<CostIngredient>): number {
  return (ingredient.quantity || 0) * (ingredient.unitPrice || 0)
}

export function createNewSimulation(name: string, description: string = ''): CostSimulation {
  return {
    id: `sim_${Date.now()}`,
    name,
    description,
    ingredients: [],
    servings: 1,
    costPerServing: 0,
    totalCost: 0,
    profitMargin: 20,
    sellingPrice: 0,
    finalPrice: 0,
    category: 'Genel',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function createNewIngredient(
  name: string,
  category: string,
  unit: string,
  unitPrice: number,
  quantity: number = 1
): CostIngredient {
  return {
    id: `ing_${Date.now()}`,
    name,
    category,
    unit,
    unitPrice,
    quantity,
    totalCost: calculateIngredientTotalCost({ quantity, unitPrice }),
    supplier: '',
    quality: 'standard',
    seasonal: false,
    lastUpdate: new Date()
  }
}

// Mock data
export const mockIngredients: CostIngredient[] = [
  {
    id: 'ing_001',
    name: 'Dana Kuşbaşı',
    category: 'Et Ürünleri',
    unit: 'kg',
    unitPrice: 485.50,
    quantity: 1,
    totalCost: 485.50,
    supplier: 'Marmara Et A.Ş.',
    quality: 'premium',
    seasonal: false,
    lastUpdate: new Date('2024-01-20')
  },
  {
    id: 'ing_002',
    name: 'Domates',
    category: 'Sebze',
    unit: 'kg',
    unitPrice: 12.50,
    quantity: 1,
    totalCost: 12.50,
    supplier: 'Antalya Sebze Hal',
    quality: 'standard',
    seasonal: true,
    lastUpdate: new Date('2024-01-20')
  },
  {
    id: 'ing_003',
    name: 'Soğan',
    category: 'Sebze',
    unit: 'kg',
    unitPrice: 8.25,
    quantity: 1,
    totalCost: 8.25,
    supplier: 'Konya Tarım Kooperatifi',
    quality: 'standard',
    seasonal: false,
    lastUpdate: new Date('2024-01-20')
  },
  {
    id: 'ing_004',
    name: 'Zeytinyağı',
    category: 'Yağlar',
    unit: 'litre',
    unitPrice: 185.00,
    quantity: 1,
    totalCost: 185.00,
    supplier: 'Ege Zeytinyağı Üreticileri',
    quality: 'premium',
    seasonal: false,
    lastUpdate: new Date('2024-01-20')
  },
  {
    id: 'ing_005',
    name: 'Pirinç',
    category: 'Tahıllar',
    unit: 'kg',
    unitPrice: 28.90,
    quantity: 1,
    totalCost: 28.90,
    supplier: 'Samsun Tarım Kooperatifi',
    quality: 'premium',
    seasonal: false,
    lastUpdate: new Date('2024-01-20')
  }
]

export const categories = [
  'Tümü',
  'Et Ürünleri',
  'Sebze',
  'Tahıllar',
  'Yağlar',
  'Süt Ürünleri',
  'Baharatlar'
]