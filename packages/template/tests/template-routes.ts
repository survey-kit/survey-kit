/**
 * Paths used when mounting the template app or survey harnesses in tests.
 * Keep aligned with `src/App.tsx` `<Route path="...">` values.
 */
export const templateRoutes = {
  home: '/',
  survey1: '/survey-1',
  chatSurvey: '/chat-survey',
  complete1: '/complete-1',
  complete2: '/complete-2',
  login: '/login',
  signOut: '/sign-out',
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
} as const
