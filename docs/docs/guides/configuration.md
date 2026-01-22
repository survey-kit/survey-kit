# Configuration Guide

Learn how to configure Survey-Kit surveys using JSON or YAML configuration files.

## Overview

Survey-Kit supports both JSON and YAML configuration formats. This flexibility allows you to choose the format that best fits your workflow and tooling.

## Basic Configuration Structure

### JSON Format

```json
{
  "id": "survey-id",
  "title": "Survey Title",
  "description": "Survey description",
  "questions": [
    {
      "id": "question-1",
      "type": "text",
      "question": "Your question here?",
      "required": true
    }
  ],
  "settings": {
    "showProgress": true,
    "allowBack": true,
    "submitButtonText": "Submit Survey"
  }
}
```

### YAML Format

```yaml
id: survey-id
title: Survey Title
description: Survey description
questions:
  - id: question-1
    type: text
    question: Your question here?
    required: true
settings:
  showProgress: true
  allowBack: true
  submitButtonText: Submit Survey
```

## Question Types

Survey-Kit supports various question types to collect different kinds of data.

### Text Input

```json
{
  "id": "name",
  "type": "text",
  "question": "What is your name?",
  "placeholder": "Enter your name",
  "required": true
}
```

### Email Input

```json
{
  "id": "email",
  "type": "email",
  "question": "What is your email?",
  "required": true,
  "validation": {
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "message": "Please enter a valid email address"
  }
}
```

### Text Area

```json
{
  "id": "feedback",
  "type": "textarea",
  "question": "Please provide your feedback",
  "rows": 5,
  "maxLength": 500
}
```

### Multiple Choice

```json
{
  "id": "preference",
  "type": "radio",
  "question": "Which do you prefer?",
  "options": [
    { "value": "option1", "label": "Option 1" },
    { "value": "option2", "label": "Option 2" },
    { "value": "option3", "label": "Option 3" }
  ],
  "required": true
}
```

### Checkboxes

```json
{
  "id": "interests",
  "type": "checkbox",
  "question": "Select your interests",
  "options": [
    { "value": "tech", "label": "Technology" },
    { "value": "design", "label": "Design" },
    { "value": "business", "label": "Business" }
  ]
}
```

## Validation Rules

Add validation to ensure data quality:

```json
{
  "id": "age",
  "type": "number",
  "question": "What is your age?",
  "validation": {
    "min": 18,
    "max": 120,
    "message": "Age must be between 18 and 120"
  }
}
```

## Conditional Logic

_Coming soon - This feature is under development._

## Survey Settings

Configure global survey behavior:

```json
{
  "settings": {
    "showProgress": true,
    "allowBack": true,
    "submitButtonText": "Complete Survey",
    "theme": "default",
    "mobileOptimized": true
  }
}
```

### Available Settings

- `showProgress`: Display progress indicator (default: `true`)
- `allowBack`: Allow users to go back to previous questions (default: `true`)
- `submitButtonText`: Custom text for submit button (default: `"Submit"`)
- `theme`: Theme name to use (default: `"default"`)
- `mobileOptimized`: Enable mobile optimisations (default: `true`)

## Theme Customisation

_This section will be expanded with detailed theming options._

## Component Overrides

_This section will cover how to override default components with custom implementations._

## Best Practices

1. **Keep questions concise**: One concept per question
2. **Use appropriate types**: Choose the right input type for your data
3. **Provide helpful placeholders**: Guide users with example inputs
4. **Validate early**: Add validation rules to catch errors immediately
5. **Test on mobile**: Ensure your survey works well on small screens

## Example Configurations

For complete working examples, check out the configurations in our [template package](https://github.com/survey-kit/survey-kit/tree/main/packages/template).

## Next Steps

- Explore the [Core API](../api/core.md) for programmatic configuration
- Learn about [Registry Components](../api/registry.md) for customisation
- Check out the [Quick Start Guide](../getting-started/quickstart.md) for implementation examples
