// use this function if you need
// { name: { en, nl, .... } }
const addLanguagePropsToObject = (obj, propsList, languagesList, defaultValue = '') => {
  propsList.forEach(property => {
    obj[property] = {}
    languagesList.forEach(language => {
      obj[property][language] = defaultValue
    })
  })

  return obj
}

// use this function if you need just
// { en, nl, .... }, without upper level property
const addLanguagePropToObject = (obj, languagesList, defaultValue = '') => {
  languagesList.forEach(language => {
    obj[language] = defaultValue
  })

  return obj
}

export { addLanguagePropsToObject, addLanguagePropToObject }
