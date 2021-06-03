import config from 'config'

const oauthWithPopup = (window, authUrl) => {
  // Create popup window for oauth flow
  const oauthWindow = window.open(authUrl, 'Give permission to' + config.name, 'height=500,width=800')

  // Wait will we receive message that oauthFlow completed
  window.addEventListener('message', (event) => {
    if (event.origin !== config.web_url) return
    window.location.reload()
  }, false);

  // "Pol" authWindow till we receive message that oauth completed successfully
  const checkConnect = setInterval(function () {

    // If window still exists, send message to check
    if (oauthWindow && !oauthWindow.closed) {
      oauthWindow.postMessage('checkIfOauthFlowSucceeded', config.web_url)
      return
    }

    // Else stop her, clear interval and go back
    clearInterval(checkConnect)

    // window.location.reload()
  }, 500)
}

export default oauthWithPopup
