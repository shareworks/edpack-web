const addLanguagePropsToObject = (obj, propsList, languagesList, defaultValue = '') => {
  propsList.forEach(property => {
    obj[property] = {}
    languagesList.forEach(language => {
      obj[property][language] = defaultValue
    })
  })
}

export default addLanguagePropsToObject
