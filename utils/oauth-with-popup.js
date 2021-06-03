import config from 'config'

const oauthWithPopup = (window, authUrl, onSuccess, onError) => {
  // PostMessages can sometimes be called multiple times, so ignore if we already handling a close
  let receivedResponse = false

  // Create popup window for oauth flow
  const oauthWindow = window.open(authUrl, 'Give permission to' + config.name, 'height=500,width=800')

  // Wait will we receive message that oauthFlow completed
  window.addEventListener('message', (event) => {
    if (receivedResponse) return
    if (event.origin !== config.web_url) return

    receivedResponse = true

    if (event.data === 'OauthInPopupSucceeded') {
      if (onSuccess) onSuccess()
      else window.location.reload()
    }
    else {
      console.error(new Error('Oauth flow went wrong!'))
      if (onError) onError()
      else window.history.back()
    }
  }, false);

  // "Pol" authWindow till we receive message that oauth completed successfully
  const checkConnect = setInterval(function () {

    // If window still exists, send message to check (only when we didnt receive a response
    if (oauthWindow && !oauthWindow.closed && !receivedResponse) {
      oauthWindow.postMessage('checkIfOauthFlowSucceeded', config.web_url)
      return
    }

    // Else stop her, clear interval and give error message
    clearInterval(checkConnect)
    console.error(new Error('Oauth flow went wrong!'))

    // Go back in history if no error cb is given
    if (onError) onError()
    else window.history.back()

  }, 500)
}

export default oauthWithPopup
