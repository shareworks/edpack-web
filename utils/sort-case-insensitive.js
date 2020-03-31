export default function sortCaseInsensitive (string1 = '', string2 = '') {
  const string1LowerCase = string1.toLowerCase()
  const string2LowerCase = string2.toLowerCase()

  if (string1LowerCase < string2LowerCase) return -1
  if (string1LowerCase > string2LowerCase) return 1
  return 0
}
