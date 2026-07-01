/** Shared product catalog enums for frontend + pool validation */

export const PRODUCT_TIERS = ['general', 'professional', 'ultimate', 'creator', 'america'];

export const PROTOCOLS = ['vless', 'hysteria2'];

export const PRODUCTS = {
  general: {
    id: 'vpny-general',
    name: 'VPNy General',
    countries: ['Canada', 'France', 'Germany', 'Netherlands', 'Norway', 'Turkey', 'United Kingdom', 'United States'],
    durations: [1, 3, 6],
    trafficOptions: [50, 100, 200],
  },
  professional: {
    id: 'vpny-professional',
    name: 'VPNy Professional',
    countries: {
      'United States': ['New York', 'Los Angeles', 'Columbus'],
      'United Kingdom': ['London'],
      'Germany': ['Frankfurt', 'Berlin'],
      'Netherlands': ['Amsterdam', 'Haarlem'],
      'Canada': ['Toronto'],
      'Australia': ['Sydney'],
      'Austria': ['Vienna'],
      'Sweden': ['Stockholm'],
      'Switzerland': ['Zurich'],
      'Poland': ['Warsaw'],
      'Turkey': ['Istanbul'],
      'India': ['Mumbai'],
      'Bulgaria': ['Sofia'],
      'Mexico': ['Queretaro'],
      'Azerbaijan': ['Baku'],
      'Nigeria': ['Lagos'],
    },
    durations: [1, 3, 6],
    trafficOptions: [50, 100],
  },
  ultimate: {
    id: 'vpny-ultimate-ai',
    name: 'VPNy Ultimate AI',
    countries: {
      'Germany': ['Frankfurt'],
      'Sweden': ['Stockholm'],
      'Switzerland': ['Geneva'],
      'United Kingdom': ['London'],
      'United States': ['New York', 'Houston'],
    },
    durations: [1, 3, 6],
    trafficOptions: [100],
  },
  creator: {
    id: 'vpny-creator',
    name: 'VPNy Creator',
    countries: ['Canada', 'Germany', 'Netherlands', 'Switzerland', 'United States'],
    durations: [3, 6],
    trafficOptions: [500, 1000, 2500, 5000],
  },
  america: {
    id: 'vpny-america-test',
    name: 'VPNy America',
    countries: ['United States'],
    durations: [6],
    trafficOptions: [50],
    protocol: 'hysteria2',
  },
};

export function durationToDays(months) {
  return months * 30;
}

export function normalizeCity(city) {
  if (!city || city.trim() === '' || city.toLowerCase() === 'country-level') {
    return null;
  }
  return city.trim();
}

export function validatePoolRow(row) {
  const errors = [];
  if (!row.external_id) errors.push('external_id is required');
  if (!PROTOCOLS.includes(row.protocol)) errors.push(`protocol must be one of: ${PROTOCOLS.join(', ')}`);
  if (!PRODUCT_TIERS.includes(row.product_tier)) errors.push(`product_tier must be one of: ${PRODUCT_TIERS.join(', ')}`);
  if (!row.country) errors.push('country is required');
  if (!row.traffic_gb || Number.isNaN(Number(row.traffic_gb))) errors.push('traffic_gb must be a number');
  if (!row.duration_days || Number.isNaN(Number(row.duration_days))) errors.push('duration_days must be a number');
  if (!row.server_ip) errors.push('server_ip is required');
  if (!row.subscription_url && !row.config_uri) errors.push('subscription_url or config_uri is required');
  return errors;
}

export function isValidCountryCity(tier, country, city) {
  const product = PRODUCTS[tier];
  if (!product) return false;

  if (Array.isArray(product.countries)) {
    if (!product.countries.includes(country)) return false;
    return normalizeCity(city) === null;
  }

  const cities = product.countries[country];
  if (!cities) return false;
  const normalized = normalizeCity(city);
  if (!normalized) return false;
  return cities.includes(normalized);
}
