export default function isUrl (location) {
  if (location.split(' ').length > 1) return false
  if (location.indexOf('http') === 0) return location
  return false
}
