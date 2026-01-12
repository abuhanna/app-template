// src/services/departmentApi.js
import api from './api'

/**
 * Get all departments
 * @param {Object} params - Query parameters
 * @returns {Promise} Promise with departments list
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
