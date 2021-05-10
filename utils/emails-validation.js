import checkRegex from './check-regex'

export default function emailsValidation (email, failedList = [], successList = [], failedData, successData) {
  if (checkRegex(email, 'email')) {
    // Success
    successList.push(successData)
    return true
  } else {
    // Failed
    failedList.push(failedData)
    return false
  }
}
