# Registry API Reference

The `@survey-kit/registry` package provides pre-built, accessible React components for building survey interfaces.

## Installation

```bash
npm install @survey-kit/registry
```

## Components

### Button

A versatile button component with multiple variants and sizes.

```typescript
import { Button } from '@survey-kit/registry';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**

| Prop       | Type                                    | Default     | Description          |
| ---------- | --------------------------------------- | ----------- | -------------------- |
| `variant`  | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Button style variant |
| `size`     | `'sm' \| 'md' \| 'lg'`                  | `'md'`      | Button size          |
| `disabled` | `boolean`                               | `false`     | Disable the button   |
| `onClick`  | `() => void`                            | -           | Click handler        |

### Input

Text input component with validation support.

```typescript
import { Input } from '@survey-kit/registry';

<Input
  type="text"
  placeholder="Enter your name"
  value={value}
  onChange={setValue}
  error={error}
/>
```

**Props:**

| Prop          | Type                                          | Default  | Description       |
| ------------- | --------------------------------------------- | -------- | ----------------- |
| `type`        | `'text' \| 'email' \| 'number' \| 'password'` | `'text'` | Input type        |
| `value`       | `string`                                      | -        | Input value       |
| `onChange`    | `(value: string) => void`                     | -        | Change handler    |
| `placeholder` | `string`                                      | -        | Placeholder text  |
| `error`       | `string`                                      | -        | Error message     |
| `disabled`    | `boolean`                                     | `false`  | Disable the input |

### Textarea

Multi-line text input component.

```typescript
import { Textarea } from '@survey-kit/registry';

<Textarea
  rows={5}
  placeholder="Enter your feedback"
  value={value}
  onChange={setValue}
/>
```

**Props:**

| Prop          | Type                      | Default | Description              |
| ------------- | ------------------------- | ------- | ------------------------ |
| `rows`        | `number`                  | `3`     | Number of rows           |
| `value`       | `string`                  | -       | Textarea value           |
| `onChange`    | `(value: string) => void` | -       | Change handler           |
| `placeholder` | `string`                  | -       | Placeholder text         |
| `maxLength`   | `number`                  | -       | Maximum character length |

### Card

Container component for grouping related content.

```typescript
import { Card } from '@survey-kit/registry';

<Card>
  <Card.Header>
    <Card.Title>Question 1</Card.Title>
  </Card.Header>
  <Card.Content>
    {/* Your content here */}
  </Card.Content>
</Card>
```

### Radio Group

Radio button group for single selection.

```typescript
import { RadioGroup } from '@survey-kit/registry';

<RadioGroup
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  value={selected}
  onChange={setSelected}
/>
```

### Checkbox Group

Checkbox group for multiple selections.

```typescript
import { CheckboxGroup } from '@survey-kit/registry';

<CheckboxGroup
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
  ]}
  values={selectedValues}
  onChange={setSelectedValues}
/>
```

### Progress Indicator

Visual progress tracker for surveys.

```typescript
import { ProgressIndicator } from '@survey-kit/registry';

<ProgressIndicator
  current={3}
  total={10}
  showPercentage={true}
/>
```

## Accessibility

All Registry components follow WCAG 2.2 AA guidelines and include:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support

## Customisation

### Styling with Tailwind

Registry components are built with Tailwind CSS and can be customised using Tailwind classes:

```typescript
<Button className="bg-blue-500 hover:bg-blue-600">
  Custom Styled Button
</Button>
```

### Theme Overrides

_Documentation for theme customisation coming soon._

## Component Library

For a complete visual reference of all components, visit the [component showcase](https://github.com/survey-kit/survey-kit/tree/main/packages/registry).

## Examples

Find usage examples in the [template package](https://github.com/survey-kit/survey-kit/tree/main/packages/template).

## Contributing

To contribute new components to the Registry, see our [Contributing Guide](https://github.com/survey-kit/survey-kit/blob/main/CONTRIBUTING.md).
