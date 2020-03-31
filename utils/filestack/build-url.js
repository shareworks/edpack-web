import fixBrokenS3Url from './fix-broken-s3-url'

export default function (appConfig, s3url, options) {
  let queryString = ''
  const queries = []
  s3url = fixBrokenS3Url(s3url)

  if (options.preview) queries.push(options.preview)
  if (options.resize) queries.push(options.resize)
  if (options.blur) queries.push(options.blur)

  if (queries.length) {
    queries.forEach((str, i) => {
      queryString += str
      if (i < queries.length - 1) queryString += '/'
    })
  }

  const result = `${appConfig.filestack.transformation_url}${appConfig.filestack.key}/${queryString}/${s3url}`
  return result
}
