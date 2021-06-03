import config from 'config'

const oauthWithPopup = (window, authUrl) => {
  const oauthWindow = window.open(authUrl, 'Give permission to' + config.name, 'height=500,width=800')

  window.addEventListener('message', (event) => {
    console.log('oauthWithPopup: ', event.origin)
    console.log('oauthWithPopup: ', event.data)
  }, false);

  const checkConnect = setInterval(function () {
    if (!oauthWindow || !oauthWindow.closed) {
      oauthWindow.postMessage('checkIfOauthFlowSucceeded', config.web_url)
      return
    }
    clearInterval(checkConnect)

    // window.location.reload()
  }, 500)
}

export default oauthWithPopup
