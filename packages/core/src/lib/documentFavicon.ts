/**
 * Sets the document favicon when running in the browser.
 * No-op when `favicon` is missing or `document` is unavailable (e.g. SSR).
 */
export function setDocumentFavicon(favicon: string | undefined): void {
  if (!favicon || typeof document === 'undefined') {
    return
  }
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = favicon
}
