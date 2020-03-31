export default function dateSorter (date1 = '', date2 = '') {
  if (date1 < date2) return 1
  if (date1 > date2) return -1
  return 0
}
