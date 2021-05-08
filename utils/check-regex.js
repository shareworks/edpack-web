export const domainRegex = /^@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))+([a-zA-Z]{2,63}|[0-9]{1,3})(\]?)$/
export const emailRegex = /^([\w\.\-]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))+([a-zA-Z]{2,63}|[0-9]{1,3})(\]?)$/

const checkRegex = (text, type) => {
  if (type === 'domain') { return domainRegex.test(text) }
  if (type === 'email') { return emailRegex.test(text) }

  return false
}

export default checkRegex
