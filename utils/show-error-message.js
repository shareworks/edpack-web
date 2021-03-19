const showErrorMessage = (context, err) => {
  err.data.errors.forEach(errMessage => {
    context.$message({ message: context.$i18n.t(`SW_${errMessage.translation}`), type: 'error' })
  })
}

export default showErrorMessage
