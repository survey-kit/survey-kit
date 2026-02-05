# Template Demo

The template package is a complete example application demonstrating
Survey-Kit's capabilities.

## Running the Template

```bash
# Clone the repository
git clone https://github.com/survey-kit/survey-kit.git
cd survey-kit

# Install dependencies
npm install

# Start the development server
make dev
# or
cd packages/template && npm run dev
```

Opens at `http://localhost:5173`

---

## What's Included

### Example Surveys

| File                       | Description                             |
| -------------------------- | --------------------------------------- |
| `surveys/survey-1.json`    | Multi-stage technology inventory survey |
| `surveys/survey-2.json`    | Optional feedback survey                |
| `surveys/chat-survey.json` | Chat-style technology preferences       |

### Routes

| Path           | Description                   |
| -------------- | ----------------------------- |
| `/`            | Landing page                  |
| `/survey-1/*`  | Form-based multi-stage survey |
| `/survey-2/*`  | Form-based feedback survey    |
| `/chat-survey` | Chat-style survey demo        |
| `/complete-1`  | Completion page for survey 1  |
| `/complete-2`  | Completion page for survey 2  |

### Configuration Files

| File                            | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `layouts/layout.config.json`    | Header, sidebar, footer configuration |
| `sections/sections.config.json` | Intro and completion page content     |
| `cookies/cookies.config.json`   | Cookie consent categories             |

---

## Customisation

### Styling

The template uses Tailwind CSS v4 with ONS design system colours. Edit
`index.css` to customise:

```css
@theme {
  --color-primary: #003c57;
  --color-secondary: #00a3e0;
  /* ... */
}
```

### Components

Components are imported from `@survey-kit/registry`. To customise:

1. Create your own component
2. Replace it in the `components` object:

```tsx
const components = {
  Button: MyCustomButton, // Use your own
  Card,
  Input,
  // ...
}
```

### Survey Configuration

Copy an existing survey JSON and modify:

```bash
cp src/surveys/survey-1.json src/surveys/my-survey.json
```

Then import and use in `App.tsx`.

---

## Project Structure

```
packages/template/
├── src/
│   ├── App.tsx              # Main app with routes
│   ├── index.css            # Tailwind + custom styles
│   ├── main.tsx             # Entry point
│   ├── surveys/             # Survey JSON configs
│   ├── layouts/             # Layout configuration
│   ├── sections/            # Section page configs
│   └── cookies/             # Cookie consent config
├── package.json
└── vite.config.ts
```

---

## Using as a Starting Point

The template is designed to be forked and customised:

1. Clone the repository
2. Keep or replace the example surveys
3. Update branding in layout config
4. Customise styling in `index.css`
5. Modify routes in `App.tsx`
6. Deploy to your platform

The template works with Vercel, Netlify, or any static hosting.
