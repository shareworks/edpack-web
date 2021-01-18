export default function downloadByLink (blob, name) {
  const anchor = window.document.createElement('a')
  anchor.href = window.URL.createObjectURL(blob)
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click() // Prevent IE: "Access is denied"
  document.body.removeChild(anchor)
}
