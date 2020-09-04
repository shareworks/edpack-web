export default function getLmsType (model) {
  if (model.availableLms.includes('canvas')) return 'canvas'
  if (model.ilearn && model.ilearn.integration) return 'ilearn'
  return false
}
