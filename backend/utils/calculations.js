/**
 * Utility functions for calculating shipping and tax
 */

// US state tax rates (simplified for demonstration)
const STATE_TAX_RATES = {
  'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
  'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
  'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
  'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
  'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
  'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
  'NM': 0.05125, 'NY': 0.04, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
  'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
  'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.061, 'VT': 0.06,
  'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04,
  'DC': 0.06
};

// Default tax rate if state not found
const DEFAULT_TAX_RATE = 0.06;

/**
 * Calculate shipping cost based on cart total and shipping location
 * @param {number} subtotal - Cart subtotal
 * @param {Object} shippingAddress - Customer's shipping address
 * @returns {number} - Shipping cost
 */
export const calculateShipping = (subtotal, shippingAddress) => {
  // Basic shipping tiers based on order total
  let shippingCost = 0;
  
  if (subtotal < 50) {
    shippingCost = 9.99;
  } else if (subtotal < 100) {
    shippingCost = 5.99;
  } else {
    shippingCost = 0; // Free shipping over $100
  }
  
  // Add international shipping fee if not in US
  const country = shippingAddress?.country || 'US';
  if (country !== 'US') {
    shippingCost += 15;
  }
  
  return parseFloat(shippingCost.toFixed(2));
};

/**
 * Get tax rate for a given US state
 * @param {string} state - Two-letter state code
 * @returns {number} - Tax rate as a decimal (e.g., 0.06 for 6%)
 */
export const getStateRate = (state) => {
  if (!state) return DEFAULT_TAX_RATE;
  
  const stateCode = state.toUpperCase();
  return STATE_TAX_RATES[stateCode] || DEFAULT_TAX_RATE;
};

/**
 * Calculate tax amount based on subtotal and shipping location
 * @param {number} subtotal - Order subtotal after discounts
 * @param {Object} shippingAddress - Customer's shipping address
 * @returns {number} - Tax amount
 */
export const calculateTax = (subtotal, shippingAddress) => {
  // No tax for international orders (handled in destination country)
  const country = shippingAddress?.country || 'US';
  if (country !== 'US') {
    return 0;
  }
  
  // Get state tax rate
  const state = shippingAddress?.state || '';
  const taxRate = getStateRate(state);
  
  // Calculate tax amount
  const taxAmount = subtotal * taxRate;
  
  return parseFloat(taxAmount.toFixed(2));
}; 