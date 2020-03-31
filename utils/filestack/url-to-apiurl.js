export default function (appConfig, filestackurl) {
  const filestackUrlId = /[^/]*$/.exec(filestackurl)[0]
  const result = appConfig.filestack.api_url.concat(encodeURIComponent(filestackUrlId))
  return result
}
