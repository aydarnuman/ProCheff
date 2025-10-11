// This file simulates a backend brand registry and CDN.
// In a real-world application, this data would be fetched from a database (like Firestore)
// and the logos would be served from a cloud storage or CDN.

// NOTE: You must add the corresponding logo files to the /public/logos/ directory.
// For example: /public/logos/pinar.png, /public/logos/migros.png

interface BrandInfo {
    name: string;
    logo: string;
}

const brandRegistry: Record<string, BrandInfo> = {
    // Product Brands
    'pınar': { name: 'Pınar', logo: '/logos/pinar.png' },
    'sek': { name: 'Sek', logo: '/logos/sek.png' },
    'sütaş': { name: 'Sütaş', logo: '/logos/sutas.png' },
    'içim': { name: 'İçim', logo: '/logos/icim.png' },
    'torku': { name: 'Torku', logo: '/logos/torku.png' },
    'reis': { name: 'Reis', logo: '/logos/reis.png' },
    'yayla': { name: 'Yayla', logo: '/logos/yayla.png' },
    'duru': { name: 'Duru', logo: '/logos/duru.png' },
    'yudum': { name: 'Yudum', logo: '/logos/yudum.png' },
    'orkide': { name: 'Orkide', logo: '/logos/orkide.png' },
    'komili': { name: 'Komili', logo: '/logos/komili.png' },
    'sinangil': { name: 'Sinangil', logo: '/logos/sinangil.png' },
    'ülker': { name: 'Ülker', logo: '/logos/ulker.png' },
    'eti': { name: 'Eti', logo: '/logos/eti.png' },

    // Store Brands / Sources
    'migros': { name: 'Migros', logo: '/logos/migros.png' },
    'a101': { name: 'A101', logo: '/logos/a101.png' },
    'carrefoursa': { name: 'CarrefourSA', logo: '/logos/carrefoursa.png' },
    'trendyol': { name: 'Trendyol', logo: '/logos/trendyol.png' },
    'metro': { name: 'Metro', logo: '/logos/metro.png' },
    'bizim toptan': { name: 'Bizim Toptan', logo: '/logos/bizimtoptan.png' },
    'şok': { name: 'Şok', logo: '/logos/sok.png' },
    'hal': { name: 'Hal', logo: '/logos/hal.png' },
};

const defaultBrand: BrandInfo = {
    name: 'Markasız',
    logo: '/logos/default.png' // A generic placeholder logo
};

/**
 * Retrieves brand information (name and logo) for a given brand name.
 * Performs a case-insensitive and trimmed search in the registry.
 * @param name - The name of the brand or store to look up.
 * @returns {BrandInfo} An object containing the canonical name and logo path.
 */
export const getBrandInfo = (name?: string): BrandInfo => {
    if (!name) return defaultBrand;
    
    // Normalize the name for lookup
    const lookupKey = name.trim().toLowerCase();

    // Direct match
    if (brandRegistry[lookupKey]) {
        return brandRegistry[lookupKey];
    }

    // Try to find a partial match (e.g., "Migros Sanal Market" should match "migros")
    const partialMatchKey = Object.keys(brandRegistry).find(key => lookupKey.includes(key));
    if (partialMatchKey) {
        return brandRegistry[partialMatchKey];
    }
    
    // If no match is found, return the default placeholder.
    return { ...defaultBrand, name: name };
};
