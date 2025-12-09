/**
 * Format price in Indian numbering system (Lakhs and Crores)
 * For values >= 1 lakh (100,000), formats as: 1.3L, 14L, 1.4CR, etc.
 * For values < 1 lakh, returns formatted number with commas
 * 
 * @param {number|string} amount - The price amount to format
 * @param {boolean} showCurrency - Whether to include ₹ symbol (default: true)
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, showCurrency = true) => {
  if (!amount && amount !== 0) return showCurrency ? '₹0' : '0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return showCurrency ? '₹0' : '0';
  
  const oneCrore = 10000000; // 1 crore = 10,000,000
  const oneLakh = 100000; // 1 lakh = 100,000
  
  let formattedPrice = '';
  
  if (numAmount >= oneCrore) {
    // Format in crores
    const crores = numAmount / oneCrore;
    const croresRounded = crores.toFixed(1);
    // Remove .0 if it's a whole number
    formattedPrice = croresRounded.endsWith('.0') 
      ? `${parseInt(croresRounded)}CR` 
      : `${croresRounded}CR`;
  } else if (numAmount >= oneLakh) {
    // Format in lakhs
    const lakhs = numAmount / oneLakh;
    const lakhsRounded = lakhs.toFixed(1);
    // Remove .0 if it's a whole number
    formattedPrice = lakhsRounded.endsWith('.0') 
      ? `${parseInt(lakhsRounded)}L` 
      : `${lakhsRounded}L`;
  } else {
    // Format with commas for values less than 1 lakh
    formattedPrice = numAmount.toLocaleString('en-IN');
  }
  
  return showCurrency ? `₹${formattedPrice}` : formattedPrice;
};

/**
 * Format price with suffix (e.g., /month, /year)
 * 
 * @param {number|string} amount - The price amount to format
 * @param {string} suffix - Suffix to append (e.g., '/month', '/year')
 * @param {boolean} showCurrency - Whether to include ₹ symbol (default: true)
 * @returns {string} Formatted price string with suffix
 */
export const formatPriceWithSuffix = (amount, suffix = '', showCurrency = true) => {
  const formatted = formatPrice(amount, showCurrency);
  return suffix ? `${formatted}${suffix}` : formatted;
};

export default formatPrice;

