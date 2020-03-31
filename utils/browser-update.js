export default {
  vs: {
    i: 10,
    f: -4,
    o: -4,
    s: 9,
    c: 40
  },
  // Specifies browser versions to notify. Negative numbers specify how much versions behind current version to notify.
  // f:22 ---> Firefox <= 22
  // c:-5 ---> Chrome <= 35 if current Chrome version is 40.
  reminder: 1,
  // after how many hours should the message reappear
  // 0 = show all the time
  reminderClosed: 150,
  // if the user explicitly closes message it reappears after x hours
  onshow (infos) {},
  onclick (infos) {},
  onclose (infos) {},
  // callback functions after notification has appeared / was clicked / closed
  l: false,
  // set a fixed language for the message, e.g. "en". This overrides the default detection.
  test: false,
  // true = always show the bar (for testing)
  text: '',
  // custom notification text (html)
  // Placeholders {brow_name} will be replaced with the browser name, {up_but} with contents of the update link tag and {ignore_but} with contents for the ignore link.
  // Example: Your browser, {brow_name}, is too old: <a{up_but}>update</a> or <a{ignore_but}>ignore</a>.
  text_xx: '',
  // custom notification text for language "xx"
  // e.g. text_de for german and text_it for italian
  newwindow: true,
  // open link in new window/tab
  url: null,
  // the url to go to after clicking the notification
  noclose: false,
  nomessage: false,
  // Do not show a message if the browser is out of date, just call the onshow callback function
  jsshowurl: '//browser-update.org/update.show.min.js',
  // URL where the script, that shows the notification, is located. This is only loaded if the user actually has an outdated browser.
  container: document.body,
  // Element where the notification will be injected.
  api: 4
}
