const buildOauthUrl = ({
  prefix, /* Required */
  lms, /* Required */
  schoolId, /* Required */
  courseId, /* Required */
  isCourseFirst, /* Required */
  $http, /* Required */
  slug = '',
  redirectUrl, /* Required */
  inPopup,
  redirectId, /* Required */
  tab, /* Required */
  postfix = ''
} = {}) => {
  const params = isCourseFirst ? `?course=${courseId}&organization=${schoolId}&origin=lti` : `?organization=${schoolId}&course=${courseId}&origin=lti`

  let authUrl = `${prefix}/auth/${lms}${params}`
  if ($http.defaults.headers.common['Lti-Access-Token']) authUrl = `${authUrl}&ltiAccessToken=${$http.defaults.headers.common['Lti-Access-Token']}`

  if (inPopup) authUrl = `${authUrl}&redirectpath=` + encodeURIComponent('oauth-succeeded')
  else authUrl = `${authUrl}&redirectpath=` + encodeURIComponent(slug + redirectUrl + '/' + redirectId + '/' + tab + postfix)

  return authUrl
}

export default buildOauthUrl
