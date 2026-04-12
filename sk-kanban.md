# Dissertation Sprints and Tickets Project Log

## Sprint 1

### Project setup

Created at: 18:30 2/11/2025

**User story**

As a maintainer, I want an initial Survey-Kit monorepo with baseline README and tooling, so that future features have a stable home and contributors know how to get started.

**Description**

Initial repository and documentation created.

**Acceptance criteria**

- Repository structure matches the intended packages (core, registry, template, etc.).
- Basic developer instructions exist (install, run template).
- Initial documentation stub is in place.

### Kanban Sprint

Created at: 19:04 2/11/2025

**User story**

As a product owner, I want Kanban work grouped into sprints on the public board, so that stakeholders can see which release window each item belonged to.

**Description**

Add sprints/versioning/pagination to separate major changes between versions.

**Acceptance criteria**

- Sprints exist as first-class data linked from cards.
- Landing page board can filter or display by sprint as designed.

### Create interim report

Created at: 17:07 6/11/2025

**User story**

As a student researcher, I want an interim dissertation report drafted for my university, so that supervisors can assess progress against the project aims.

**Description**

For the dissertation side of the project, the interim report needs to be created for university.

**Acceptance criteria**

- Report covers motivation, methods, and progress to date per programme requirements.
- Submitted or shared through the required faculty channel.

### Mirror GitHub repo to GitLab repo

Created at: 17:08 6/11/2025

**User story**

As a maintainer, I want GitHub changes mirrored to the required GitLab submission repo, so that university coursework rules are satisfied without manual copying.

**Description**

Submissions of code must be on GitLab. Ensure that any code from GitHub is mirrored to GitLab.

**Acceptance criteria**

- Mirroring automation or documented process keeps GitLab in sync.
- Evidence of sync available for submission if needed.

### ONS Branding

Created at: 19:02 2/11/2025

**User story**

As a survey author, I want configurable branding (logos, header/footer variants, favicon), so that deployed surveys can reflect organisational identity responsively.

**Description**

Add branding kit with logo configuration (header/footer with responsive small/large variants) and favicon support.

**Acceptance criteria**

- Config supports light path for logo URLs and layout slots.
- Responsive header/footer behaviour works at small and large breakpoints.

### Navigation and Validation

Created at: 19:03 2/11/2025

**User story**

As a survey respondent, I want navigation blocked until required questions are answered, with the sidebar in sync, so that I cannot skip mandatory steps accidentally.

**Description**

Implement requiredToNavigate for page blocking and fixed sidebar state synchronisation.

**Acceptance criteria**

- requiredToNavigate (or equivalent) prevents forward navigation when invalid.
- Sidebar highlights match the active page after programmatic navigation.

### Form Components

Created at: 19:03 2/11/2025

**User story**

As a survey author, I want accessible checkbox and native select controls in the registry, so that common question types render consistently and meet WCAG 2.2 AA.

**Description**

Add custom checkbox component (ONS-styled) and fixed dropdown component (native HTML select).

**Acceptance criteria**

- Checkbox matches design system styling and label association.
- Select uses native element with proper labelling and error linkage.

### Layout System

Created at: 19:03 2/11/2025

**User story**

As a survey author, I want a layout system with main content, footer, and collapsible sidebar, so that surveys feel like a product rather than a bare form.

**Description**

Add main-content and footer components with responsive sidebar (collapsible, icons support).

**Acceptance criteria**

- Layout components compose without breaking mobile-first flow.
- Sidebar collapse and icon mode behave per spec.

## Sprint 2

### Collapsable Sidebar Headers

Created at: 17:57 24/11/2025

**User story**

As a survey respondent, I want sidebar navigation grouped under collapsible section headers, so that long surveys stay scannable and I can jump to the right block of pages quickly.

**Description**

Group items in the sidebar.

**Acceptance criteria**

- Sidebar supports grouped items with expand/collapse behaviour.
- State is predictable when navigating between pages.
- Layout remains usable on mobile widths.

### Improve progress bars

Created at: 20:54 24/11/2025

**User story**

As a survey respondent, I want a clear two-part progress indicator, so that I understand both overall completion and what remains in the current section.

**Description**

Fix styling and add the second (remaining) part of the bar.

**Acceptance criteria**

- Progress UI shows completed vs total (or equivalent) in line with design.
- The secondary segment of the bar (remaining work) is visible and styled consistently.
- Components do not rely on colour alone to convey progress (WCAG-friendly patterns).

### Advanced Logic Engine

Created at: 17:16 24/11/2025

**User story**

As a survey author, I want conditional logic expressed in the survey JSON, so that respondents only see relevant questions without bespoke code.

**Description**

Conditional Logic to JSON file.

**Acceptance criteria**

- Conditions evaluate from answers / state as documented.
- Edge cases (missing answers, jumps) behave deterministically.
- Template or docs include working examples.

## Sprint 3

### Update README with Live Template

Created at: 10:13 11/12/2025

**User story**

As a framework developer, I want the README to link to the live template demo, so that I can try Survey-Kit in the browser before cloning the repo.

**Description**

The live template at [https://template.survey-kit.com](https://template.survey-kit.com) should be added to the README for users to view it easily.

**Acceptance criteria**

- README includes [https://template.survey-kit.com](https://template.survey-kit.com) (or current live URL).
- Link is visible in the primary onboarding path (e.g. intro or Quick start).

### Feature: Sections

Created at: 10:16 15/1/2026

**User story**

As a survey author, I want to define logical sections (intro pages, dividers) in the survey JSON, so that respondents get bite-sized chapters instead of one endless form.

**Description**

Currently the design is just a survey without an introduction page or separation. I want to create sections like a blank page similar to the design system ONS uses:

[https://onsdigital.github.io/eq-author-design-system-react/?path=/story/author-design-system-patterns-mainlayout--with-service-navigation](https://onsdigital.github.io/eq-author-design-system-react/?path=/story/author-design-system-patterns-mainlayout--with-service-navigation)

**Acceptance criteria**

- Schema supports section boundaries aligned with mobile-first flow.
- Renderer shows section-style pages (blank or intro content) per config.
- Behaviour is consistent with one-question-per-page navigation.

### Sprint 3 Clean Up

Created at: 14:48 8/1/2026

**User story**

As a survey respondent, I want progress and sidebar chrome to behave correctly, so that I am not misled by wrong percentages or confusing collapse icons.

**Description**

Progress bar error. Unusual Sidebar collapse icon.

**Acceptance criteria**

- The progress bar reflects actual survey state after the fixes.
- Sidebar collapse affordance matches design and works across breakpoints.

### Emoji Slider

Created at: 15:45 8/1/2026

**User story**

As a survey respondent, I want an emoji-based slider that meets WCAG 2.2 AA, so that engaging scales remain perceivable and operable with assistive tech.

**Description**

Create a WCAG 2.2 AA compliant emoji slider component.

**Acceptance criteria**

- Components pass targeted axe (or equivalent) checks.
- Contrast, labels, and keyboard operation meet AA.
- Value is exposed to assistive technologies correctly.

### Improve Toasts on Errors

Created at: 10:05 11/12/2025

**User story**

As a survey respondent, I want validation errors shown inline with fields (not only as toasts), so that I know exactly what to fix before progressing.

**Description**

Compliant error messages beneath inputs.

5-compliant-panels

**Acceptance criteria**

- Errors associated with the correct inputs programmatically and visually.
- Pattern follows WCAG error-identification guidance.

### Add Template Link to Website

Created at: 10:25 11/12/2025

**User story**

As a visitor, I want the live template linked from survey-kit.com, so that I can open the demo without hunting through GitHub.

**Description**

Add the [https://template.survey-kit.com](https://template.survey-kit.com) to this website.

**Acceptance criteria**

- [https://template.survey-kit.com](https://template.survey-kit.com) linked from landing content.
- Link opens correctly in a new tab or same tab per UX choice.

### Initial AWS Infra

Created at: 15:37 22/12/2025

**User story**

As a maintainer, I want minimal AWS static hosting for the template build, so that there is a second deployment target beside Vercel for demos.

**Description**

Create simple infrastructure without a backend to save data and just display the compiled frontend application.

Result: [https://aws-template.survey-kit.com](https://aws-template.survey-kit.com)

**Acceptance criteria**

- Public URL serves the built SPA (e.g. aws-template.survey-kit.com).
- Infra is reproducible from repo docs or IaC.

## Sprint 4

### Initial MkDocs

Created at: 17:25 22/1/2026

**User story**

As a framework developer, I want to publish MkDocs documentation for Survey-Kit, so that adopters can learn how to configure and extend surveys without reading the whole codebase.

**Description**

Creation of MkDocs after the first part finished.

**Acceptance criteria**

- Documentation site builds and deploys successfully.
- Core concepts (JSON survey config, registry, template) are covered at a high level.
- Links from the repo or landing page reach the docs site.

### Improve Docs

Created at: 09:24 4/2/2026

**User story**

As a contributor, I want MkDocs content and linting for documentation, so that docs stay accurate and style issues are caught in CI.

**Description**

Add linting and more documentation to the MkDocs.

**Acceptance criteria**

- Docs linting runs in a pipeline or via a documented local command.
- Additional pages/sections reflect current framework behaviour.

### Fix tabs

Created at: 11:04 4/2/2026

**User story**

As a survey respondent, I want tab controls to match the design system, so that I can recognise focus, selection, and keyboard interaction reliably.

**Description**

Tabs don't look like they're meant to.

**Acceptance criteria**

- Visual design matches intended tokens (spacing, active state).
- Keyboard and screen-reader semantics follow WCAG 2.2 AA patterns.

### Update landing-page with docs link

Created at: 18:11 22/1/2026

**User story**

As a visitor to survey-kit.com, I want a clear link to documentation, so that I can move from marketing content to technical detail in one click.

**Description**

The main page will be a docs link on GitHub, but it should be mentioned on the landing page too.

**Acceptance criteria**

- Landing page surfaces docs link in an obvious location.
- Link targets the canonical docs URL.

### Update landing-page with new UI

Created at: 09:38 29/1/2026

**User story**

As a visitor, I want the landing page rebuilt with a coherent modern UI, so that the project looks credible and I can find key links quickly.

**Description**

Old UI was dysfunctional.

**Acceptance criteria**

- New layout ships to production.
- Core CTAs (template, docs, etc.) remain discoverable.

### GDPR Compliance

Created at: 15:23 3/2/2026

**User story**

As a survey respondent, I want explicit cookie consent (accept/decline), so that I understand tracking and can align with GDPR expectations.

**Description**

Create a component that allows the user to accept or decline cookies.

The Respondent (End-User) As a respondent, I want to provide explicit consent for specific data uses, so that I retain full control over my personal information.

The Researcher (Framework User) As a researcher, I want to implement automated, granular consent prompts, so that I can ensure my data collection is legally compliant.

The Subject (Right to Erasure) As a participant, I want to request the deletion of my response data easily, so that my right to be forgotten is honoured.

**Acceptance criteria**

- Banner or modal captures consent without blocking access unlawfully.
- Choice is persisted per design (session vs stored preference).
- Researcher-facing hooks exist to respect declined analytics where applicable.

### Default Button Focus Fix

Created at: 12:53 5/2/2026

**User story**

As a keyboard user, I want the primary button’s focus ring to be as visible as secondary styles, so that I always know which control has focus.

**Description**

When tabbing onto the default button, the outline is white and the user can't easily see that they are currently on it. This needs to be fixed and look similar to the secondary/outline button.

**Acceptance criteria**

- Focus indicator contrast meets WCAG non-text contrast guidance.
- Visual parity with outline/secondary button focus treatment.

### Fix WCAG 2.2 AA Elements with DevTools

Created at: 11:38 12/2/2026

**User story**

As a survey respondent relying on assistive tech, I want to know WCAG 2.2 AA issues from automated audit fixes, so that the template is closer to production-ready accessibility.

**Description**

Using AxeCore DevTools on Chrome, a few issues were highlighted with the accessibility of the page.

**Acceptance criteria**

- Axe (or agreed tool) critical issues from the audit are resolved or documented exceptions.
- Spot-check with keyboard-only navigation passes for changed widgets.

### Chat Style Interface

Created at: 16:50 22/1/2026

**User story**

As a survey respondent, I want an optional chat-style survey presentation, so that the experience feels conversational on mobile and aligns with engagement goals.

**Description**

Create the chat version of the application.

**Acceptance criteria**

- Chat flow renders from survey config.
- Answers and validation integrate with the existing core state.

### Backend Creation

Created at: 09:48 5/2/2026

**User story**

As a framework developer, I want a backend that authenticates users and stores responses, so that the template demonstrates a realistic data path.

**Description**

As part of the demonstration of the core and registry in the template, we want to show how this app would actually work. We need a backend that can authorise users into the application and then save their responses.

**Acceptance criteria**

- Auth gate works for the demo scenario.
- Submissions persist and can be retrieved by authorised roles.

## Sprint 5

### Fix CORS for backend

Created at: 14:15 17/2/2026

**User story**

As a framework developer, I want the template frontend to call the backend without CORS failures, so that authenticated flows and data submission work in deployment.

**Description**

Backend blocks due to CORS errors.

**Acceptance criteria**

- Browser requests from the template origin succeed against the API for required methods.
- Preflight (OPTIONS) responses are correct where applicable.
- Documented origins or env configuration match deployment.

### Use custom domain

Created at: 12:03 19/2/2026

**User story**

As someone reading Survey-Kit documentation, I want a stable custom domain (e.g. docs.survey-kit.com), so that links do not break when hosting details change.

**Description**

Use docs.survey-kit.com instead of the github pages url.

**Acceptance criteria**

- Docs resolve on the agreed custom domain with valid HTTPS.
- Old GitHub Pages URL redirects or is updated everywhere it was advertised.

### Update PR template

Created at: 12:27 19/2/2026

**User story**

As a contributor, I want a PR template with a clear checklist, so that merges meet testing, docs, and accessibility expectations.

**Description**

Remind me to complete certain checklist items before merging a PR.

**Acceptance criteria**

- Opening a PR shows the checklist in GitHub/GitLab.
- Items reflect team priorities (tests, breaking changes, etc.).

### Bump MkDocs to 2.0

Created at: 12:03 19/2/2026

**User story**

As a maintainer, I want MkDocs upgraded to 2.x, so that the docs build passes on current GitHub Actions runners and security issues are addressed.

**Description**

Error shown in: Deploy to GitHub Pages: [https://github.com/survey-kit/survey-kit/actions/runs/22177155368/job/64137287612](https://github.com/survey-kit/survey-kit/actions/runs/22177155368/job/64137287612)

**Acceptance criteria**

- Docs workflow completes without the previous failure.
- Rendered site is smoke-tested for broken navigation or plugins.

### Refactor useSurvey

Created at: 14:43 18/2/2026

**User story**

As a framework developer, I want useSurvey refactored into smaller modules, so that survey state, validation, and navigation are easier to reason about and extend.

**Description**

Feature creep has caused the single file approach for the hook to become difficult to maintain. Spreading this file out into different components makes more sense.

**Acceptance criteria**

- Public hook API remains stable for the template or is migrated with notes.
- Unit tests cover critical navigation and validation paths.

### Refactor sections of the core API

Created at: 19:16 19/2/2026

**User story**

As a framework developer, I want messy sections of the core API refactored, so that parsing and rendering logic is easier to maintain and test.

**Description**

Some code is messy so it's best to refactor it to be cleaner to understand.

**Acceptance criteria**

- Behaviour parity with pre-refactor flows.
- Tests or snapshot checks guard regressions.

### Clearer chat UI

Created at: 12:37 25/2/2026

**User story**

As a survey respondent using chat-style surveys, I want a copy that clarifies I am not chatting with a human, so that expectations match the automated interface.

**Description**

Explain to the user that they aren't interacting with another person, it is just a chat survey interface instead.

**Acceptance criteria**

- Intro or persistent helper text explains the chat UX.
- Copy is readable and does not block task completion.

### Add Engaging Components to Chat Survey

Created at: 10:18 12/2/2026

**User story**

As a survey respondent in chat mode, I want registry “engaging” components available where appropriate, so that the conversational flow feels as rich as the classic template.

**Description**

As part of the engaging aspects of the project, the chat style interface should also incorporate some of the engaging components from the registry.

**Acceptance criteria**

- At least one registry component path works inside a chat renderer.
- No regressions to core chat navigation.

### Add privacy/consent policy

Created at: 12:36 25/2/2026

**User story**

As a survey author, I want first-class support in the framework for attaching privacy and consent policies, so that respondents see how personal data may be used beyond cookies.

**Description**

Build support for privacy policies / consent policies into the framework (not the content, but support for adding them). Whilst the cookies suggest the user consents to their metadata and tracking data, they need a notice / consent that they may have their personal data (address, phone number, birth dates etc.) collected.

**Acceptance criteria**

- Schema supports policy URLs or content slots without embedding legal text in code only.
- UI surfaces the policy where configured; documented for authors.

### Admin dashboard

Created at: 16:44 16/2/2026

**User story**

As an administrator, I want an RBAC-protected dashboard to browse responses and basic analytics, so that I can monitor a live survey deployment safely.

**Description**

Create RBAC protected dashboard for admins to view responses and analytics.

**Acceptance criteria**

- Only authenticated admin roles reach dashboard routes.
- Responses list loads with filtering or cross-tab as designed.

### Add banner stating unofficial collaboration to landing page

Created at: 14:34 30/3/2026

**User story**

As a visitor, I want a prominent banner stating the ONS collaboration is unofficial, so that I am not misled about endorsement or sponsorship.

**Description**

"This is an unofficial collaboration with the ONS." to the top of the landing page to make it clearer.

**Acceptance criteria**

- Banner text matches approved wording and is visible above the fold.
- Banner does not break keyboard focus order catastrophically.

### Remove ONS branding

Created at: 14:34 30/3/2026

**User story**

As a project stakeholder, I want default branding shifted to Survey-Kit and demo content free of sensitive ONS-specific artefacts, so that copyright risk is reduced while features remain demonstrable.

**Description**

Possibility that having ONS branding may conflict with copyright laws. Default to having SurveyKit branding instead and don't use the Tech Audit Tool data survey details, just demonstrate each functionality.

**Acceptance criteria**

- Default assets and copy use Survey-Kit branding.
- Demo survey content illustrates functionality without tied ONS datasets.

## Sprint 6

### Automated Testing

Created at: 14:34 25/3/2026

**User story**

As a developer, I want to run unit testing and integration testing, so that I can ensure the survey works as intended and individual components work properly and stay correct as the code changes.

**Description**

Use Vitest (with jsdom) as the test runner for the template, aligned with the existing Vite setup.

**Acceptance criteria**

- npm test runs Vitest and all tests pass.
- Unit tests test conditional and validation rules using config from the template surveys.
- Integration tests test the demo survey JSON and prove interactions without requiring a live backend.

### Unusual chat survey behaviour on input

Created Apr 3, 2026

**Description**

When on chat survey, if a user on mobile inputs in an input box, the page will auto scroll. This PR removes that wrong auto scroll function.

### Chat survey consent gate not configured properly

Created Apr 3, 2026

**Description**

When on a new chat survey, a consent gate is shown and if accepted it redirects back to default (url.com/) now it redirects back to the chat survey ([url.com/chat-survey](http://url.com/chat-survey))

### Ability to switch surveys on admin

Created Apr 3, 2026

**Description**

On the admin dashboard, an admin should be able to switch between surveys to view different results.

### Chat survey submits

Created Apr 3, 2026

**Description**

Enable the submission of chat surveys.

### Add a GET_STARTED.md and Kanban Sprints Docs to the project

Created Apr 12, 2026

**Description**

As part of the dissertation project, a GET_STARTED.md and Kanban Sprints Docs should be added to the project to help the reader understand the project and the progress of the project.
