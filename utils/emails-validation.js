import { emailRegex } from './check-regex'

export default function emailsValidation (email, failedList = [], successList = [], failedData, successData) {
  if (emailRegex.test(email)) {
    // Success
    successList.push(successData)
    return true
  } else {
    // Failed
    failedList.push(failedData)
    return false
  }
}
