export default function (options) {
  const resize = []
  let resizeString = ''

  if (options.width) resize.push(`width:${options.width}`)
  if (options.height) resize.push(`height:${options.height}`)
  if (options.fit) resize.push(`fit:${options.fit}`)
  if (options.align) resize.push(`align:${options.align}`)

  if (resize.length) {
    resize.forEach((str, i) => {
      if (i === 0) resizeString += 'resize='
      resizeString += str
      if (i < resize.length - 1) resizeString += ','
    })
  }

  return resizeString
}
