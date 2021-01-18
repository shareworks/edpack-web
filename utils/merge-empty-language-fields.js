const checkValue = (element) => {
  // If both values filled - stop, no need to copy values
  if (element.en && element.nl) { return null }
  // If both values empty - stop, no need to copy values
  if (!element.en && !element.nl) { return null }
  // One values is empty - copy it from another language
  else if (element.en) { element.nl = element.en }
  else { element.en = element.nl }
}

const mergeEmptyLanguageFields = (form, props = []) => {
  props.forEach(propertyName => {
    // run over each element in array and check its properties
    if (Array.isArray(form[propertyName])) {
      form[propertyName].forEach(element => {
        checkValue(element)
      })
    }

    // If element has .en property - check is another language filled
    else if (form[propertyName].hasOwnProperty('en')) {
      checkValue(form[propertyName])
    }
  })
}

export default mergeEmptyLanguageFields
