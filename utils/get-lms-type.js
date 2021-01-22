export default function getLmsType (model) {
  if (!model || (!model.lms && !model.availableLms)) return false
  if (model.lms && model.lms !== 'none') return model.lms

  // deprecated
  if (model.availableLms.includes('canvas')) return 'canvas'
  if (model.availableLms.includes('brightspace')) return 'brightspace'
  if (model.availableLms.includes('blackboard')) return 'blackboard'
  if (model.ilearn && model.ilearn.integration) return 'ilearn'
  return false
}
