// Find out if in LTI or not
const urlParams = new URLSearchParams(window.location.search)
const origin = urlParams.get('origin')
const sessionOrigin = sessionStorage.getItem('origin')

const inLTI = (window.self !== window.top) || (origin === 'lti') || (sessionOrigin === 'lti')

// Set/Remove sessionStorage
inLTI ? sessionStorage.setItem('origin', 'lti') : sessionStorage.removeItem('origin')

export default inLTI
