# Project Log

## Week 1 (w/c 13/10/25):

- Initial setup of GitHub repository ([#1](https://github.com/survey-kit/survey-kit/pull/1))

## Week 2 (w/c 20/10/25):

- N/A

## Week 3 (w/c 27/10/25):

- Add GitLab mirroring with GitHub Actions

### Features

- **ONS Branding Integration**: Added branding kit with logo configuration (header/footer with responsive small/large variants) and favicon support
- **Navigation & Validation**: Implemented `requiredToNavigate` for page blocking and fixed sidebar state synchronisation
- **Form Components**: Added custom checkbox component (ONS-styled) and fixed dropdown component (native HTML select)
- **Layout System**: Added main-content and footer components with responsive sidebar (collapsible, icons support)

### Design System

- Integrated ONS colour palette (CSS variables), Open Sans typography and brand colour tokens

### Bug Fixes

- Fixed sidebar not updating on page navigation
- Resolved dropdown rendering issue on page-3

### Technical

- Code formatting and CSS refinements for responsive layouts

> Released as **v0.1.0** ([#2](https://github.com/survey-kit/survey-kit/pull/2))

## Week 4 (w/c 03/11/25)

- Renamed documentation files to recommended filenames and extensions ([#3](https://github.com/survey-kit/survey-kit/pull/3))

---

## Week 7 (w/c 24/11/25)

### Features

- **Conditional Logic**: Show or hide questions, pages, groups and stages based on user answers ([#4](https://github.com/survey-kit/survey-kit/pull/4))
- **Stage Navigation**: Added stage tabs component for multi-stage surveys
- **Sidebar Improvements**: Collapsible sidebar items with enhanced progress bar visualisation

### Technical

- Version bumps and added README/LICENSE to `core` and `registry` packages

> Released as **v0.1.1** ([#5](https://github.com/survey-kit/survey-kit/pull/5))

---

## Week 9 (w/c 08/12/25)

- Added link to [template.survey-kit.com](https://template.survey-kit.com) in the main README ([#6](https://github.com/survey-kit/survey-kit/pull/6))

---

## Week 11 (w/c 22/12/25)

### Infrastructure

- **AWS Deployment**: Added Terraform configuration and CI to deploy the template frontend to S3 with CloudFront ([#7](https://github.com/survey-kit/survey-kit/pull/7))
- Fixed template build issue

---

## Week 13 (w/c 05/01/26)

### Features

- **WCAG-Compliant Panels**: Added Panel component with error/info/success variants using `role="alert"` and `role="status"` for accessibility; replaced inline error divs in SurveyRenderer with `aria-describedby` and `aria-invalid` attributes ([#8](https://github.com/survey-kit/survey-kit/pull/8))
- **Emoji Slider**: Created emoji slider component across core, registry and template packages ([#10](https://github.com/survey-kit/survey-kit/pull/10))
- **Sidebar Menu**: Persistent sidebar state and secondary colour tokens

### Technical

- General clean-up, formatting and multiple-children-per-question support in example config ([#9](https://github.com/survey-kit/survey-kit/pull/9))

---

## Week 14 (w/c 12/01/26)

- N/A

---

## Week 15 (w/c 19/01/26)

### Features

- **Section Pages**: Created section page components for grouping survey content ([#11](https://github.com/survey-kit/survey-kit/pull/11))
- **Chat-Style Interface**: Introduced initial conversational rendering mode for surveys ([#15](https://github.com/survey-kit/survey-kit/pull/15))
- **GDPR Compliance**: Added cookie consent and privacy components ([#14](https://github.com/survey-kit/survey-kit/pull/14))

### Documentation

- Set up MkDocs documentation with GitHub Actions deployment ([#12](https://github.com/survey-kit/survey-kit/pull/12))
- Fixed docs build and linting ([#13](https://github.com/survey-kit/survey-kit/pull/13))
- Updated version numbers and READMEs

---

## Week 17 (w/c 02/02/26)

### Features

- **Backend Service**: Created Express-based backend with DynamoDB integration, containerised Lambda deployment via ECR and API Gateway (HTTP API v2) ([#19](https://github.com/survey-kit/survey-kit/pull/19))

### Bug Fixes

- Fixed default button behaviour causing unintended form submissions ([#20](https://github.com/survey-kit/survey-kit/pull/20))
- Fixed broken package exports and registry imports ([#21](https://github.com/survey-kit/survey-kit/pull/21))
- Resolved mobile layout and touch interaction issues ([#22](https://github.com/survey-kit/survey-kit/pull/22))
- Fixed tabs and sidebar icon rendering ([#16](https://github.com/survey-kit/survey-kit/pull/16))

### Documentation

- Improved API and guide documentation ([#18](https://github.com/survey-kit/survey-kit/pull/18))
- Added AWS SSO login instructions to infra README

### Technical

- Updated dependencies across all packages ([#17](https://github.com/survey-kit/survey-kit/pull/17))

---

## Week 19 (w/c 16/02/26)

### Accessibility

- Fixed remaining WCAG 2.2 AA errors across the template ([#23](https://github.com/survey-kit/survey-kit/pull/23))

### Infrastructure

- **Local Backend Development**: Added standalone Express dev server with hot-reload, concurrent template + backend dev mode (`make dev`) and `.env`-based configuration
- **CORS Configuration**: Terraform now supports multiple allowed origins via `allowed_origins` variable with domain fallback

### Core

- Refactored useSurvey hook to use a directory module structure for better testability and clarity. (#25[#25](https://github.com/survey-kit/survey-kit/pull/25))

### Documentation

- Updated documentation URL to [docs.survey-kit.com](https://docs.survey-kit.com/)
- Fix version issues with MkDocs by bumping to MkDocs 2.0 ([#24](https://github.com/survey-kit/survey-kit/pull/26))

### Extra

- Updated pull request template

## Week 20 (w/c 23/02/26)

### Features

- **Chat UX Improvements**: Added an information icon (i in a circle) in the chat header to open a bottom drawer explaining the survey context, how answer editing works and that users are interacting with a survey (not a human or AI) ([#28](https://github.com/survey-kit/survey-kit/pull/28))
- **Message Bubble Simplification**: Removed repeated "(tap to edit)" text from each answer bubble to reduce visual duplication
- **Icon Consistency**: Updated chat drawer controls to use `lucide-react` icons (`Info`, `X`)

### Registry

- **ChatContainer Enhancements**: Added `showInfoButton` and `infoDrawerContent` props and provided default information drawer copy in British English

## Week 20 (w/c 02/03/26)

### Documentation

- Updated documentation to include the new information drawer and API reference links ([#28](https://github.com/survey-kit/survey-kit/pull/28))

- Updated documentation to include the new consent gate and API reference links ([#29](https://github.com/survey-kit/survey-kit/pull/29))

### Features

- **Consent Gate**: Added a consent gate component to handle user consent for data collection ([#29](https://github.com/survey-kit/survey-kit/pull/29))

### Registry

- **Consent Gate**: Added consent gate component to handle user consent for data collection ([#29](https://github.com/survey-kit/survey-kit/pull/29))

### Template

- **Consent Gate**: Added consent gate component to handle user consent for data collection ([#29](https://github.com/survey-kit/survey-kit/pull/29))

## Week 21 (w/c 09/03/26)

### Features

- **Admin Dashboard**: Implemented administrative dashboard for survey analytics.
- **Dynamic Filtering**: Added a cross-tabulation filtering system that automatically extracts filterable dimensions from survey JSON configurations.
- **Cognito Authentication**: Integrated AWS Cognito for administrative access to the dashboard.
- **Analytics Service**: Enhanced the backend service to support query-based filtering and statistical aggregation.

### Core

- **Dashboard Metadata**: Added `DashboardConfig` and `DashboardFilter` types.
- **Filter Extraction**: Created `extractFilterableQuestions` utility for dynamic UI generation.
- **Dashboard Renderer**: Added a new renderer for administrative data visualization.

### Registry

- **Filter Sidebar**: Created a vertical sidebar component for managing dynamic dashboard filters.
- **Admin Charts**: Added `TrendLineChart` and `DropoffBarChart` components for data visualisation.

### Infrastructure

- **Cognito Integration**: Added Terraform modules and backend configuration for AWS Cognito User Pools.
- **Documentation**: Added guides for backend filtering, API references and infrastructure setup.

## Week 21 (w/c 16/03/26)

### Features

- **Admin Dashboard**: Expanded the admin dashboard to include a list of all responses and a detailed view of a response.

All admin stuff: ([#31](https://github.com/survey-kit/survey-kit/pull/31))

## Week 22 (w/c 23/03/26)

## Week 23 (w/c 30/03/26)

### Features

- Possibility that having ONS branding may conflict with copyright laws. Default to having SurveyKit branding instead and don't use the Tech Audit Tool data survey details, just demonstrate each functionality. Removed branding and updated survey-1.
- Fixed issue with flattened lists. ([#32](https://github.com/survey-kit/survey-kit/pull/32))

### Technical

- **Automated testing (template)**: Vitest with jsdom, React Testing Library and axe; unit tests for validation and conditional logic; integration tests for JSON-driven form and chat surveys, app routing, consent and admin flows (with mocked APIs where needed); workspace `npm test` / coverage scripts; Node 25 localStorage workaround on test runs ([#33](https://github.com/survey-kit/survey-kit/pull/33))

### Core

- **SurveyRenderer**: Associated labels with controls (`htmlFor` / `id`) and normalised empty values on text, textarea and select fields for accessibility and stable controlled inputs ([#33](https://github.com/survey-kit/survey-kit/pull/33))

### Bug Fixes

- When on chat survey, if a user on mobile inputs in an input box, the page will auto scroll. This PR removes that wrong auto scroll function.
- When on a new chat survey, a consent gate is shown and if accepted it redirects back to default (url.com/) now it redirects back to the chat survey (url.com/chat-survey) ([#34](https://github.com/survey-kit/survey-kit/pull/34))

[Pull Request #35](https://github.com/survey-kit/survey-kit/pull/35):

- **DashboardRenderer**: Survey filter UI + `surveyFilter` / related types on `DashboardConfig`.
- **Template**: Chat survey submits via `submitSurveyResponse` (same pattern as survey-1).
- **Admin dashboard**: Survey scope dropdown from `surveyFilter` in dashboard config; analytics supports optional `surveyId` (all surveys when omitted).
- **Docs**: API/core, registry dashboard, backend analytics, template guide and chat guide updates for submit and survey scope.

## Week 24 (w/c 06/04/26)

[Pull Request #36](https://github.com/survey-kit/survey-kit/pull/36):

- **Dashboard**: Collapsible filter sidebar and sidebar width adjustments.
- **Core**: Shared `setDocumentFavicon` helper for setting the document favicon.
- **Registry**: Chat layout tidy-up (less duplicate CSS, improved mobile padding on the chatbox); `ChatInput` uses a single primary control (Skip when optional and empty, Send otherwise; required empty state shows disabled Send).
- **Template**: `ChatSurveyPage` takes `completionRoute` from the route (same pattern as `SurveyPage`); default view shows chat and admin shortcuts; section page styles adjusted for different viewports.
- **Docs**: Chat and template guides updated for post-submit navigation via `completionRoute`.
- **Tooling**: `make prepare` for Husky hooks; package version bumps; Vercel deployment fix.
