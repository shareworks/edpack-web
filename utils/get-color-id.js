export default function getColorId (id) {
  if (!id) return 'color-8'

  function calcColor (id) {
    const time = parseInt(id.substr(0, 8), 16)
    const offset = parseInt(id.substr(18, 6), 16)
    const index = (time + offset) % 8
    return `color-${index}`
  }

  return calcColor(id)
}
