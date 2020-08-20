const buildOauthUrl = ({
  prefix,        /* Required */
  lms,           /* Required */
  schoolId,      /* Required */
  courseId,      /* Required */
  isCourseFirst, /* Required */
  $http,         /* Required */
  slug = '',
  redirectUrl,   /* Required */
  redirectId,    /* Required */
  tab,           /* Required */
  postfix = ''
} = {}) => {
  const params = isCourseFirst ? `?course=${courseId}&organization=${schoolId}` : `?organization=${schoolId}&course=${courseId}`

  let authUrl = `${prefix}/auth/${lms}${params}`
  if ($http.defaults.headers.common['Lti-Access-Token']) authUrl = `${authUrl}&ltiAccessToken=${$http.defaults.headers.common['Lti-Access-Token']}`
  authUrl = `${authUrl}&redirectpath=${slug}${redirectUrl}/${redirectId}/${tab}${postfix}`

  return authUrl
}

export default buildOauthUrl


