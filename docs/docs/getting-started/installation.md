# Installation

This guide will help you install Survey-Kit and set up your development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher

You can verify your installations by running:

```bash
node --version
npm --version
```

## Installing Survey-Kit Packages

Survey-Kit consists of three main packages that work together. You can install them individually based on your needs:

### Core Package

The core package provides the survey rendering engine and state management:

```bash
npm install @survey-kit/core
```

### Registry Package

The registry package includes pre-built, accessible UI components:

```bash
npm install @survey-kit/registry
```

### Install Both Packages

For most projects, you'll want both packages:

```bash
npm install @survey-kit/core @survey-kit/registry
```

## Using the Template

The quickest way to get started is by using our template application:

```bash
# Clone the repository
git clone https://github.com/survey-kit/survey-kit.git

# Navigate to the template
cd survey-kit/packages/template

# Install dependencies
npm install

# Start the development server
npm run dev
```

The template includes:

- Example survey configurations
- Component usage patterns
- Best practices implementation
- Ready-to-use development setup

## Development Dependencies

If you're contributing to Survey-Kit or customising components, you may need additional dependencies:

```bash
npm install --save-dev @types/react @types/react-dom
npm install tailwindcss autoprefixer postcss
```

## Verify Installation

To verify that Survey-Kit is installed correctly, create a simple test file:

```typescript
import { useSurvey } from '@survey-kit/core'
import { Button } from '@survey-kit/registry'

// If this imports without errors, you're good to go!
```

## Next Steps

Now that you have Survey-Kit installed, proceed to the [Quick Start Guide](quickstart.md) to create your first survey.

## Troubleshooting

### Common Issues

**Module not found errors**

Ensure all dependencies are installed:

```bash
npm install
```

**TypeScript errors**

Make sure you have TypeScript configured in your project:

```bash
npm install --save-dev typescript
npx tsc --init
```

**Version conflicts**

Check that you're using compatible versions:

```bash
npm list @survey-kit/core @survey-kit/registry
```

For more help, visit our [GitHub Issues](https://github.com/survey-kit/survey-kit/issues).
