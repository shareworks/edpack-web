import Papa from 'papaparse'
import slugify from 'slugify'
import downloadByLink from './download-by-link'

const downloadCsv = (data, name, delimiter) => {
  const csv = Papa.unparse(data, { delimiter: delimiter || ';' })
  const csvName = slugify(name) + '.csv'
  const blob = new Blob([csv])

  if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveBlob(blob, csvName)
  else downloadByLink(blob, csvName)
}

export default downloadCsv
