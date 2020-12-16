const basicVisibilityChanged = (isVisible, entry, hiddenClass, visibleClass, additionalLogicFunction, ...args) => {
  const { target } = entry

  if (isVisible) {
    target.classList.remove(hiddenClass)
    target.classList.add(visibleClass)
  } else {
    target.classList.add(hiddenClass)
  }

  if (additionalLogicFunction) {
    additionalLogicFunction(...args)
  }
}

export default basicVisibilityChanged
