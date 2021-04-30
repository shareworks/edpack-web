const inLTI = () => {
  // In iframe LTI
  if (window.self !== window.top) return true

  // In blank page LTI
  const urlParams = new URLSearchParams(window.location.search)

  const newLtiTab = urlParams.get('fromLtiTab')
  const origin = urlParams.get('origin')
  const sessionOrigin = sessionStorage.getItem('origin')
  if (newLtiTab || (origin === 'lti' || sessionOrigin === 'lti')) {
    sessionStorage.setItem('origin', 'lti')
    return true
  }

  // Not in LTI
  sessionStorage.removeItem('origin')
  return false
}

export default inLTI()
