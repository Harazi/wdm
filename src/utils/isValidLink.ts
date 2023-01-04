export function isValidLink(url: string) {
  if (!url.match(/https?:\/\/i/)) {
    url = `http://${url}`
  }
  try {
    const { href } = new URL(url)
    return href
  } catch (err) { return false }
}
