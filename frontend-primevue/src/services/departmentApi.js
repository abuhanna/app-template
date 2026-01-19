// src/services/departmentApi.js
import api from './api'

/**
 * @typedef {import('@/types').PagedResult} PagedResult
 * @typedef {import('@/types').SortDirection} SortDirection
 */

/**
 * Parameters for fetching departments with pagination
 * @typedef {Object} GetDepartmentsParams
 * @property {number} [page] - Page number (1-indexed)
 * @property {number} [pageSize] - Number of items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {SortDirection} [sortDir] - Sort direction ('asc' or 'desc')
 * @property {string} [search] - Search term
 * @property {boolean} [isActive] - Filter by active status
 */

/**
 * Get departments with pagination support
 * @param {GetDepartmentsParams} params - Query parameters
 * @returns {Promise<PagedResult>} Promise with paginated departments result
 */
export async function fetchDepartments(params = {}) {
  const response = await api.get('/departments', { params })
  return response.data
}

/**
 * Get department by ID
 * @param {number} id - Department ID
 * @returns {Promise} Promise with department data
 */
export async function fetchDepartment(id) {
  const response = await api.get(`/departments/${id}`)
  return response.data
}

/**
 * Create a new department
 * @param {Object} data - Department data
 * @returns {Promise} Promise with created department
 */
export async function createDepartment(data) {
  const response = await api.post('/departments', data)
  return response.data
}

/**
 * Update an existing department
 * @param {number} id - Department ID
 * @param {Object} data - Department data to update
 * @returns {Promise} Promise with updated department
 */
export async function updateDepartment(id, data) {
  const response = await api.put(`/departments/${id}`, data)
  return response.data
}

/**
 * Delete (deactivate) a department
 * @param {number} id - Department ID
 * @returns {Promise} Promise
 */
export async function deleteDepartment(id) {
  await api.delete(`/departments/${id}`)
}
