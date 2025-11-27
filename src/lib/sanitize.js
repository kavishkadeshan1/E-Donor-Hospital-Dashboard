/**
 * Input Sanitization Utilities
 * Prevents script injection and XSS attacks
 */

/**
 * Sanitize a string by removing script tags and dangerous HTML
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove other dangerous tags
  sanitized = sanitized.replace(/<(iframe|object|embed|link|style|img|svg|math|form|input|button|select|textarea)[^>]*>/gi, '')
  
  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '')
  
  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data\s*:/gi, '')
  
  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript\s*:/gi, '')
  
  // Remove expression() CSS (IE XSS vector)
  sanitized = sanitized.replace(/expression\s*\(/gi, '')
  
  return sanitized.trim()
}

/**
 * Sanitize all string values in an object
 * @param {object} obj - Object with values to sanitize
 * @returns {object} - Object with sanitized values
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Check if input contains potential script/XSS content
 * @param {string} input - The input string to check
 * @returns {boolean} - True if suspicious content detected
 */
export const containsScript = (input) => {
  if (typeof input !== 'string') return false
  
  const scriptPatterns = [
    /<script/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<svg/i,
    /expression\s*\(/i,
    /data\s*:/i,
    /vbscript\s*:/i
  ]
  
  return scriptPatterns.some(pattern => pattern.test(input))
}

export default { sanitizeInput, sanitizeObject, containsScript }
