import { get, post } from './request'

/**
 * Get current training material info
 */
export function fetchTrainingMaterial() {
  return get('/api/v1/training/current')
}

/**
 * Confirm training completion
 */
export function confirmTraining(materialId = 'ai-basic-training', version = '2026.07') {
  return post('/api/v1/training/confirm', { materialId, version })
}
