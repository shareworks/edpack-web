import slugify from 'slugify'
import downloadByLink from './download-by-link'

const downloadExcel = (data, name) => {
  const csvName = slugify(name) + '.xlsx'
  const blob = new Blob([data], { type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })

  if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveBlob(blob, csvName)
  else downloadByLink(blob, csvName)
}

export default downloadExcel
