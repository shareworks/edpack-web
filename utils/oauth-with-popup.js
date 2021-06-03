import config from 'config'

const oauthWithPopup = (window, authUrl) => {
  const oauthWindow = window.open(authUrl, 'Give permission to' + config.name, 'height=500,width=800')

  const checkConnect = setInterval(function () {
    if (!oauthWindow || !oauthWindow.closed) {
      oauthWindow.postMessage('checkIfOauthFlowSucceeded', "http://example.com")
      return
    }
    clearInterval(checkConnect)

    // window.location.reload()
  }, 100)
}

export default oauthWithPopup
