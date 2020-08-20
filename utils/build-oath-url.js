const buildOathUrl = (prefix = '', lms, schoolId, courseId, isCourseFirst, $http, slug = '', courseTab, postfix = '') => {

  const params = isCourseFirst ? `?course=${courseId}&organization=${schoolId}` : `?organization=${schoolId}&course=${courseId}`

  let authUrl = `${prefix}/auth/${lms}${params}`
  if ($http.defaults.headers.common['Lti-Access-Token']) authUrl = `${authUrl}&ltiAccessToken=${$http.defaults.headers.common['Lti-Access-Token']}`
  authUrl = `${authUrl}&redirectpath=${slug}course/${courseId}/${courseTab}${postfix}`

  return authUrl
}

export default buildOathUrl
