/**
 * Initial `MemoryRouter` entry when tests replace `BrowserRouter` (see App tests).
 * Read at render time so each test can set the path before `render()`.
 */
let initialEntry = '/'

export function setAppTestInitialRoute(path: string) {
  initialEntry = path
}

export function getAppTestInitialRoute(): string {
  return initialEntry
}

export function resetAppTestInitialRoute() {
  initialEntry = '/'
}
