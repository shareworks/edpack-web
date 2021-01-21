const copyObjectProps = (properties, objectToChange, objectChangeFrom) => {
  properties.forEach(propName => {
    objectToChange[propName] = objectChangeFrom[propName]
  })
}

export default copyObjectProps
