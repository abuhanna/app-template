// src/services/userApi.js
import api from './api'

/**
 * @typedef {import('@/types').PagedResult} PagedResult
 * @typedef {import('@/types').SortDirection} SortDirection
 */

/**
 * Parameters for fetching users with pagination
 * @typedef {Object} GetUsersParams
 * @property {number} [page] - Page number (1-indexed)
 * @property {number} [pageSize] - Number of items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {SortDirection} [sortDir] - Sort direction ('asc' or 'desc')
 * @property {string} [search] - Search term
 * @property {boolean} [isActive] - Filter by active status
 * @property {number} [departmentId] - Filter by department ID
 */

/**
 * Get users with pagination support
 * @param {GetUsersParams} params - Query parameters
 * @returns {Promise<PagedResult>} Promise with paginated users result
 */
export async function getUsers(params = {}) {
  const response = await api.get('/users', { params })
  return response.data
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise} Promise with user data
 */
export async function getUserById(id) {
  const response = await api.get(`/users/${id}`)
  return response.data
}

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Promise} Promise with created user
 */
export async function createUser(data) {
  const response = await api.post('/users', data)
  return response.data
}

/**
 * Update an existing user
 * @param {number} id - User ID
 * @param {Object} data - User data to update
 * @returns {Promise} Promise with updated user
 */
export async function updateUser(id, data) {
  const response = await api.put(`/users/${id}`, data)
  return response.data
}

/**
 * Delete (deactivate) a user
 * @param {number} id - User ID
 * @returns {Promise} Promise
 */
export async function deleteUser(id) {
  await api.delete(`/users/${id}`)
}

/**
 * Change user password
 * @param {number} id - User ID
 * @param {Object} data - Password data
 * @returns {Promise} Promise
 */
export async function changePassword(id, data) {
  const response = await api.post(`/users/${id}/change-password`, data)
  return response.data
}
