# Consent Gate

The Consent Gate is a critical barrier component that blocks access to the survey application until the user explicitly accepts or rejects your terms. It is typically used for privacy policies, data collection consent, or any legal agreement required before proceeding.

## Features

- **Full-screen blocking mode:** Prevents users from interacting with the underlying application until a decision is made.
- **Persistent state:** Uses `localStorage` to save user consent (`accepted` or `rejected`) so it doesn't repeatedly show up on page reload.
- **Instance isolation:** Through the `useConsent(instanceId)` hook, you can run multiple independent consent gates (e.g. general privacy, specific research consent) without them colliding.
- **Customisable reject state:** Fully configurable "You cannot continue" static page displayed upon refusal, preventing access.
- **Rich privacy notice:** A dedicated, structured sub-modal to view the full legal notice formatted with titles, descriptions, and bullet points.
- **Re-review capability:** Allows users to access their accepted consent later (e.g. from a footer link) to re-read or revoke it.

## Overview

The Consent Gate architecture relies on four main pieces:

1. A JSON configuration file (`ConsentConfig`).
2. A state hook (`useConsent`) that binds to `localStorage`.
3. A React Context (`ConsentProvider`) to share the state globally.
4. The `ConsentGate` React component that renders the full-screen UI.

## Adding the Consent Gate

### 1. Create a configuration

Create a JSON file (e.g., `consents.config.json`) defining the consent content:

```json
{
  "id": "privacy",
  "title": "Privacy and personal data",
  "description": "Please review and confirm you understand before continuing.",
  "dataTypes": [
    { "id": "address", "label": "Postal address" },
    { "id": "phone", "label": "Phone number" }
  ],
  "acceptButtonText": "I understand and agree",
  "rejectButtonText": "I do not agree",
  "noticeLinkText": "View full privacy notice",
  "noticeBackText": "Back",
  "rejectedTitle": "You cannot continue",
  "rejectedDescription": "You have declined consent required for this application.",
  "rejectedLinkText": "Leave this site",
  "rejectedLinkHref": "https://www.google.com",
  "noticeBlocks": [
    {
      "title": "Full Privacy Notice",
      "subtitle": "What data we collect",
      "bulletPoints": [
        "Postal address — used to understand geographic distribution."
      ]
    }
  ]
}
```

### 2. Configure State and Context in App

Integrate the logic into your main `App.tsx`:

```tsx
import {
  ConsentGate,
  useConsent,
  ConsentProvider,
  type ConsentConfig,
} from '@survey-kit/registry'
import privacyConfig from './consents.config.json'

function App() {
  const privacyAuth = useConsent('privacy') // 'privacy' is the unique instance ID

  const consentContextValue = {
    status: privacyAuth.status,
    shouldShowGate: privacyAuth.shouldShowGate,
    accept: privacyAuth.accept,
    reject: privacyAuth.reject,
    reset: privacyAuth.reset,
    showModal: privacyAuth.showModal,
    hideModal: privacyAuth.hideModal,
  }

  // Handle re-review route requests or actions from your layout
  const handleShowPrivacyInfo = () => {
    privacyAuth.showModal()
  }

  return (
    <ConsentProvider value={consentContextValue}>
      {/* 1. Show Gate when pending, or when explicitly triggered by a re-review */}
      {privacyAuth.isLoaded && privacyAuth.shouldShowGate && (
        <ConsentGate
          config={privacyConfig as ConsentConfig}
          status={privacyAuth.status}
          onAccept={() => privacyAuth.accept()}
          onReject={() => privacyAuth.reject()}
          onCancel={
            privacyAuth.status !== 'pending' ? privacyAuth.hideModal : undefined
          }
        />
      )}

      {/* 2. Show static blocked screen if rejected natively */}
      {privacyAuth.isLoaded &&
        privacyAuth.status === 'rejected' &&
        !privacyAuth.shouldShowGate && (
          <ConsentGate
            config={privacyConfig as ConsentConfig}
            status={privacyAuth.status}
            onAccept={privacyAuth.accept}
            onReject={privacyAuth.reject}
            onReReview={privacyAuth.reset} // Resets the state back to pending
          />
        )}

      {/* 3. Render your actual application if consent is accepted */}
      {privacyAuth.isLoaded &&
        privacyAuth.status === 'accepted' &&
        !privacyAuth.shouldShowGate && <YourMainApplication />}
    </ConsentProvider>
  )
}
```

## Re-reviewing Consent

To give users the option to review their accepted privacy terms, trigger the `showModal()` method from the shared `useConsentContext()`.

Because the `onCancel` prop is provided to `ConsentGate` during a `shouldShowGate` state while `status !== 'pending'`, it will automatically provide a "Go back and leave application as is" button that safely closes the gate without mutating the user's previously accepted response.
