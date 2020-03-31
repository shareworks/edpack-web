export default function (opt) {
  const options = Object.assign({ format: 'png', page: 1 }, opt)
  const output = []
  let outputString = ''

  if (options.format) output.push(`format:${options.format}`)
  if (options.page) output.push(`page:${options.page}`)
  if (options.density) output.push(`density:${options.density}`)
  if (options.secure) output.push(`secure:${options.secure}`)
  if (options.docinfo) output.push(`docinfo:${options.docinfo}`)
  if (options.pageformat) output.push(`pageformat:${options.pageformat}`)
  if (options.pageorientation) output.push(`pageorientation:${options.pageorientation}`)

  if (output.length) {
    output.forEach((str, i) => {
      if (i === 0) outputString += 'output='
      outputString += str
      if (i < output.length - 1) outputString += ','
    })
  }

  return outputString
}
