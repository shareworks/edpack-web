export default function getLmsType (model) {
  if (model.availableLms.includes('canvas')) return 'canvas'
  return false
}
