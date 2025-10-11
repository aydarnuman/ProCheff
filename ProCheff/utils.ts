import { RecipeIngredient, PriceList } from './types';

export const getBaseUnit = (unit: string): 'kg' | 'l' | 'adet' | null => {
    if (['kg', 'g'].includes(unit)) return 'kg';
    if (['l', 'ml'].includes(unit)) return 'l';
    if (['adet'].includes(unit)) return 'adet';
    return null;
};

export const convertToBaseUnitValue = (value: number, unit: string): number => {
    if (unit === 'g' || unit === 'ml') {
        return value / 1000;
    }
    return value;
};


export const calculateCost = (ingredients: RecipeIngredient[], priceList: PriceList): number => {
    if (!ingredients || ingredients.length === 0) {
        return 0;
    }
    
    return ingredients.reduce((total, item) => {
        const priceInfo = priceList[item.name];
        if (!priceInfo) {
            return total;
        }

        // Use manual price if status is manual and price is set, otherwise use AI/default price
        const effectivePrice = priceInfo.status === 'manual' && priceInfo.manualOverridePrice != null
            ? priceInfo.manualOverridePrice
            : priceInfo.price;

        if (effectivePrice === null || isNaN(effectivePrice)) {
            return total;
        }

        // 1. Calculate price per base unit (kg, l, or adet)
        let pricePerBaseUnit = effectivePrice;
        if (priceInfo.packageSize && priceInfo.packageUnit && priceInfo.unit === 'adet') {
            const packageSizeInBase = convertToBaseUnitValue(priceInfo.packageSize, priceInfo.packageUnit);
            if (packageSizeInBase > 0) {
                pricePerBaseUnit = effectivePrice / packageSizeInBase;
            }
        }
        
        const priceBaseUnit = priceInfo.packageUnit ? getBaseUnit(priceInfo.packageUnit) : getBaseUnit(priceInfo.unit);

        // 2. Adjust for cooking loss (fire)
        let rawQty = item.qty;
        if (item.lossPercentage && item.lossPercentage > 0 && item.lossPercentage < 100) {
            rawQty = item.qty / (1 - item.lossPercentage / 100);
        }

        // 3. Convert ingredient quantity to its base unit
        const itemQtyInBaseUnit = convertToBaseUnitValue(rawQty, item.unit);
        const itemBaseUnit = getBaseUnit(item.unit);

        // 4. Calculate cost if units are compatible
        if (priceBaseUnit && itemBaseUnit && priceBaseUnit === itemBaseUnit) {
             return total + (pricePerBaseUnit * itemQtyInBaseUnit);
        }
        
        // Fallback for direct 'adet' to 'adet' match without package info
        if (priceInfo.unit === 'adet' && item.unit === 'adet' && !priceInfo.packageSize) {
             return total + (effectivePrice * rawQty);
        }

        return total;
    }, 0);
};