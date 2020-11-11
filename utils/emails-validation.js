export default function emailsValidation (email, failedEmails = []) {
  const emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/

  if (emailRegex.test(email)) {
    return true
  } else {
    failedEmails.push(email)
    return false
  }
}
