export default function getLmsType (model) {
  if (!model.availableLms) return false
  if (model.availableLms.includes('canvas')) return 'canvas'
  if (model.availableLms.includes('brightspace')) return 'brightspace'
  if (model.availableLms.includes('blackboard')) return 'blackboard'
  if (model.ilearn && model.ilearn.integration) return 'ilearn'
  return false
}
