/**
 * Utility functions for data transformation
 */

/**
 * Convert snake_case to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} - Object with camelCase keys
 */
const toCamelCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return newObj;
};

/**
 * Convert camelCase to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} - Object with snake_case keys
 */
const toSnakeCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return newObj;
};

/**
 * Format submission object from database to API response
 * @param {Object} submission - Submission from database
 * @returns {Object} - Formatted submission
 */
const formatSubmission = (submission) => {
  return {
    id: submission.id,
    employeeId: submission.employee_id,
    employeeName: submission.employee_name,
    employeeNip: submission.employee_nip,
    department: submission.department,
    type: submission.type,
    subType: submission.sub_type,
    date: submission.date,
    reason: submission.reason,
    description: submission.description,
    status: submission.status,
    submittedAt: submission.submitted_at,
    reviewedAt: submission.reviewed_at,
    reviewedBy: submission.reviewed_by,
    reviewNote: submission.review_note
  };
};

/**
 * Format multiple submissions
 * @param {Array} submissions - Array of submissions from database
 * @returns {Array} - Array of formatted submissions
 */
const formatSubmissions = (submissions) => {
  if (!Array.isArray(submissions)) return [];
  return submissions.map(formatSubmission);
};

module.exports = {
  toCamelCase,
  toSnakeCase,
  formatSubmission,
  formatSubmissions
};
