# Survey Configuration

Learn how to structure surveys using JSON or YAML.

## Hierarchy

Survey-Kit uses a hierarchical structure:

```
Survey
└── Stages (top-level sections)
    └── Groups (logical groupings)
        └── Pages (one screen)
            └── Questions (form fields)
```

This hierarchy enables:

- **Stage tabs** for major survey sections
- **Sidebar navigation** for groups within stages
- **One question per page** for mobile-first clarity
- **Conditional visibility** at any level

## Basic Structure

```json
{
  "id": "my-survey",
  "title": "My Survey",
  "stages": [
    {
      "id": "stage-1",
      "title": "About You",
      "groups": [
        {
          "id": "basics",
          "title": "Basic Information",
          "pages": [
            {
              "id": "page-name",
              "questions": [
                {
                  "id": "name",
                  "type": "text",
                  "label": "What is your name?",
                  "requiredToNavigate": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Question Types

### text

Single-line text input.

```json
{
  "id": "name",
  "type": "text",
  "label": "What is your name?",
  "placeholder": "Enter your name"
}
```

### textarea

Multi-line text input.

```json
{
  "id": "feedback",
  "type": "textarea",
  "label": "Any additional comments?"
}
```

### email

Email input with validation.

```json
{
  "id": "email",
  "type": "email",
  "label": "Your email address"
}
```

### number

Numeric input.

```json
{
  "id": "age",
  "type": "number",
  "label": "Your age"
}
```

### radio

Single selection from options.

```json
{
  "id": "preference",
  "type": "radio",
  "label": "Which do you prefer?",
  "options": [
    { "value": "option-a", "label": "Option A" },
    { "value": "option-b", "label": "Option B" }
  ]
}
```

### checkbox

Multiple selection from options.

```json
{
  "id": "interests",
  "type": "checkbox",
  "label": "Select your interests",
  "options": [
    { "value": "tech", "label": "Technology" },
    { "value": "design", "label": "Design" },
    { "value": "business", "label": "Business" }
  ]
}
```

### select

Dropdown selection.

```json
{
  "id": "country",
  "type": "select",
  "label": "Select your country",
  "options": [
    { "value": "uk", "label": "United Kingdom" },
    { "value": "us", "label": "United States" }
  ]
}
```

### emoji-slider

Visual rating scale with emojis.

```json
{
  "id": "satisfaction",
  "type": "emoji-slider",
  "label": "How satisfied are you?",
  "emojiSlider": {
    "type": "scale",
    "scale": 5,
    "showLabels": true
  }
}
```

---

## Question Properties

| Property             | Type           | Description                       |
| -------------------- | -------------- | --------------------------------- |
| `id`                 | `string`       | Unique identifier                 |
| `type`               | `QuestionType` | Input type                        |
| `label`              | `string`       | Question text                     |
| `description`        | `string`       | Helper text                       |
| `placeholder`        | `string`       | Input placeholder                 |
| `required`           | `boolean`      | Must be answered                  |
| `requiredToNavigate` | `boolean`      | Must be answered to proceed       |
| `options`            | `array`        | Options for radio/checkbox/select |
| `validation`         | `array`        | Validation rules                  |
| `conditional`        | `object`       | Show/hide logic                   |

---

## Conditional Logic

Show questions based on previous answers.

```json
{
  "id": "other-reason",
  "type": "text",
  "label": "Please specify",
  "conditional": {
    "conditions": [
      {
        "questionId": "reason",
        "operator": "equals",
        "value": "other"
      }
    ]
  }
}
```

### Multiple Conditions

```json
{
  "conditional": {
    "conditions": [
      { "questionId": "age", "operator": "equals", "value": "18-25" },
      { "questionId": "employed", "operator": "equals", "value": "yes" }
    ],
    "logic": "AND"
  }
}
```

Operators: `equals`, `notEquals`

Logic: `AND` (default), `OR`

---

## Validation Rules

```json
{
  "id": "age",
  "type": "number",
  "label": "Your age",
  "validation": [
    { "type": "required", "message": "Age is required" },
    { "type": "min", "value": 18, "message": "Must be 18 or older" },
    { "type": "max", "value": 120, "message": "Please enter a valid age" }
  ]
}
```

Validation types:

- `required` – Field must have a value
- `min` – Minimum numeric value
- `max` – Maximum numeric value
- `pattern` – Regex pattern match

---

## Navigation Settings

```json
{
  "navigation": {
    "stageOrder": "sequential",
    "groupOrder": "free",
    "pageOrder": "sequential"
  }
}
```

| Setting      | Values                | Description                   |
| ------------ | --------------------- | ----------------------------- |
| `stageOrder` | `sequential` / `free` | Must complete stages in order |
| `groupOrder` | `sequential` / `free` | Must complete groups in order |
| `pageOrder`  | `sequential` / `free` | Must complete pages in order  |

---

## YAML Format

The same configuration in YAML:

```yaml
id: my-survey
title: My Survey
stages:
  - id: stage-1
    title: About You
    groups:
      - id: basics
        title: Basic Information
        pages:
          - id: page-name
            questions:
              - id: name
                type: text
                label: What is your name?
                requiredToNavigate: true
```
