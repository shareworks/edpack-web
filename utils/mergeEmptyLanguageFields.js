const checkValue = (element, currentLanguage, otherLang) => {
  // both values filled - stop this iteration
  if (element[currentLanguage] && element[otherLang]) { return null }
  // add exist value to another side
  else if (element[currentLanguage]) { element[otherLang] = element[currentLanguage] }
  else { element[currentLanguage] = element[otherLang] }
}

const mergeEmptyLanguageFields = (form, currentLanguage) => {
  const otherLang = currentLanguage === 'nl' ? 'en' : 'nl'

  for (const key in form) {
    // run over each element in array
    if (Array.isArray(form[key])) {
      form[key].forEach(element => {
        checkValue(element, currentLanguage, otherLang)
      })
    }

    // check element values
    if (form[key].hasOwnProperty('en')) {
      checkValue(form[key], currentLanguage, otherLang)
    }
  }
}

export default mergeEmptyLanguageFields
