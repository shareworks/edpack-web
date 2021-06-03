const oauthWithPopup = (window, authUrl) => {
  const oauthWindow = window.open(authUrl, 'Buddycheck Oauth2.0', 'height=800,width=600')

  const checkConnect = setInterval(function () {
    if (!oauthWindow || !oauthWindow.closed) return
    clearInterval(checkConnect)
    window.location.reload()
  }, 100)
}

export default oauthWithPopup
