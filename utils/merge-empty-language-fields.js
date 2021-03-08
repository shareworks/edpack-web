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
    console.log(propertyName)
    // run over each element in array and check its properties
    if (Array.isArray(form[propertyName])) {
      if (form[propertyName].title) { // hack for team questions in Buddycheck
        return form[propertyName].title.forEach(element => {
          checkValue(element)
        })
      }
      form[propertyName].forEach(element => {
        checkValue(element)
      })
    } else if (Object.prototype.hasOwnProperty.call(form[propertyName], 'en')) {
      // If element has .en property - check is another language filled
      checkValue(form[propertyName])
    }
  })
}

export default mergeEmptyLanguageFields
