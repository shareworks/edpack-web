export default function (url) {
  const lastSlashIndex = url.lastIndexOf('/')
  if (lastSlashIndex < 0) return url
  const specialChars = /[+ :]/gi // <- add characters to check if string is already encoded by encodeURIComponent
  const firstPart = url.substring(0, lastSlashIndex + 1)
  const substring = url.substring(lastSlashIndex + 1)
  if (!specialChars.test(substring)) return url
  const result = firstPart + encodeURIComponent(substring)
  return result
}
