# Installation

## Prerequisites

- **Node.js**: Version 18+
- **npm**: Version 9+

## Install Packages

```bash
# Install both packages (recommended)
npm install @survey-kit/core @survey-kit/registry
```

Or install individually:

```bash
# Core only (survey engine)
npm install @survey-kit/core

# Registry only (UI components)
npm install @survey-kit/registry
```

## Using the Template

The quickest way to start is cloning the template:

```bash
git clone https://github.com/survey-kit/survey-kit.git
cd survey-kit/packages/template
npm install
npm run dev
```

Opens at `http://localhost:5173` with example surveys and both rendering modes.

## Peer Dependencies

Survey-Kit requires:

- React 18+
- Tailwind CSS v4

## Verify Installation

```typescript
import { useSurvey, SurveyRenderer } from '@survey-kit/core'
import { Button, Input } from '@survey-kit/registry'

// If this compiles, you're ready!
```

## Next Steps

Continue to the [Quick Start](quickstart.md) to build your first survey.
