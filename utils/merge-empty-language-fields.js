const checkValue = (element) => {
  // If both values filled - stop, no need to copy values
  if (element.en && element.nl) {
    return null
  }

  // If both values empty - stop, no need to copy values
  if (!element.en && !element.nl) {
    return null
  } else if (element.en) {
    // One values is empty - copy it from another language
    element.nl = element.en
  } else {
    element.en = element.nl
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
