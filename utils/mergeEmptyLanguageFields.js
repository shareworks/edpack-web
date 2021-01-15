const checkValue = (element, currentLanguage, otherLang) => {
  // If both values filled - stop, no need to copy values
  if (element[currentLanguage] && element[otherLang]) { return null }
  // If both values empty - stop, no need to copy values
  if (!element[currentLanguage] && !element[otherLang]) { return null }
  // One values is empty - copy it from another language
  else if (element[currentLanguage]) { element[otherLang] = element[currentLanguage] }
  else { element[currentLanguage] = element[otherLang] }
}

const mergeEmptyLanguageFields = (form, currentLanguage) => {
  const otherLang = currentLanguage === 'nl' ? 'en' : 'nl'

  for (const key in form) {
    // run over each element in array and check its properties
    if (Array.isArray(form[key])) {
      form[key].forEach(element => {
        checkValue(element, currentLanguage, otherLang)
      })
    }

    // If element has .en property - check is another language filled
    if (form[key].hasOwnProperty('en')) {
      checkValue(form[key], currentLanguage, otherLang)
    }
  }
}

export default mergeEmptyLanguageFields
