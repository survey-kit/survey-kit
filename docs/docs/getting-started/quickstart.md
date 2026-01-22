# Quick Start

This guide will walk you through creating your first survey with Survey-Kit in just a few minutes.

## Step 1: Create a Survey Configuration

Survey-Kit uses JSON or YAML files to define survey structure. Create a file called `survey.json`:

```json
{
  "id": "my-first-survey",
  "title": "My First Survey",
  "description": "A simple survey to get started",
  "questions": [
    {
      "id": "name",
      "type": "text",
      "question": "What is your name?",
      "required": true
    },
    {
      "id": "email",
      "type": "email",
      "question": "What is your email address?",
      "required": true,
      "validation": {
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      }
    },
    {
      "id": "feedback",
      "type": "textarea",
      "question": "How can we improve?",
      "required": false
    }
  ]
}
```

## Step 2: Create a Survey Component

Create a React component to render your survey:

```typescript
import { useSurvey } from '@survey-kit/core';
import { SurveyRenderer } from '@survey-kit/core';
import surveyConfig from './survey.json';

function MySurvey() {
  const survey = useSurvey(surveyConfig);

  const handleComplete = (data) => {
    console.log('Survey completed!', data);
    // Handle survey submission here
  };

  return (
    <div className="survey-container">
      <SurveyRenderer
        survey={survey}
        onComplete={handleComplete}
      />
    </div>
  );
}

export default MySurvey;
```

## Step 3: Add Styling

Survey-Kit components work with Tailwind CSS. Ensure you have Tailwind configured in your project.

Add some basic styles to your survey container:

```css
.survey-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}
```

## Step 4: Run Your Survey

Start your development server:

```bash
npm run dev
```

Navigate to your survey component, and you should see your first Survey-Kit survey!

## Understanding the Flow

Survey-Kit handles the survey flow automatically:

1. **Question Display**: Shows one question at a time
2. **Validation**: Validates answers before proceeding
3. **Progress Tracking**: Updates progress as users complete questions
4. **Data Collection**: Collects all answers in a structured format
5. **Completion**: Calls your `onComplete` handler with the results

## Next Steps

### Customise Components

Learn how to customise Survey-Kit components to match your brand:

```typescript
import { Button, Input } from '@survey-kit/registry';

<Button variant="primary" size="lg">
  Custom Button
</Button>
```

### Advanced Configuration

Explore more advanced features:

- Conditional logic
- Multi-step surveys
- Custom validation rules
- Progress persistence
- Custom themes

Check out the [Configuration Guide](../guides/configuration.md) for more details.

### API Reference

For a complete reference of available components and hooks, see:

- [Core API Documentation](../api/core.md)
- [Registry Components](../api/registry.md)

## Example Surveys

Visit our [template application](https://github.com/survey-kit/survey-kit/tree/main/packages/template) for more complete examples, including:

- Multi-page surveys
- Conditional questions
- File uploads
- Rating scales
- And more!

## Need Help?

If you run into any issues:

- Check the [API Reference](../api/core.md)
- Visit our [GitHub Repository](https://github.com/survey-kit/survey-kit)
- Open an [Issue](https://github.com/survey-kit/survey-kit/issues)
