const checkValue = (element) => {
  // @TODO: replace for third language -- i didn't find a good solution, right now
  // maybe pass the array of languages and then do reduce() to count is any of fields is filled and so on

  // If both values filled - stop, no need to copy values
  if (element.en.trim() && element.nl.trim()) return null

  // If both values empty - stop, no need to copy values
  if (!element.en.trim() && !element.nl.trim()) {
    return null
  } else if (element.en.trim()) {
    // One values is empty - copy it from another language
    element.nl = element.en.trim()
  } else {
    element.en = element.nl.trim()
  }
}

const mergeEmptyLanguageFields = (form, props = []) => {
  props.forEach(propertyName => {
    // run over each element in array and check its properties
    if (Array.isArray(form[propertyName]) && form[propertyName].length) {
      form[propertyName].forEach(element => {
        if (element.title) return checkValue(element.title)
        checkValue(element)
      })
    } else if (Object.prototype.hasOwnProperty.call(form[propertyName], 'en')) {
      // If element has .en property - check is another language filled
      checkValue(form[propertyName])
    }
  })
}

export default mergeEmptyLanguageFields
