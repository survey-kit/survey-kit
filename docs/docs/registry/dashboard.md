# Dashboard Components

The Dashboard components are designed for administrative interfaces, providing data visualisation and advanced filtering capabilities.

## Admin Charts

Survey-Kit provides pre-configured chart components that integrate seamlessly with the backend analytics service:

- **TrendLineChart**: Displays survey response trends over time, helping you identify peak periods of activity.
- **DropoffBarChart**: Visualises where respondents are leaving your survey, grouped by stage.

## Dynamic Filtering

One of the most powerful features of the Admin Dashboard is its dynamic filtering system. Instead of hardcoding filter options, Survey-Kit can automatically generate a filtering interface directly from your survey configuration.

### How it Works

1. **Extraction**: The `extractFilterableQuestions` utility from `@survey-kit/core` parses your `survey.json` and identifies all categorical questions (e.g. Radio, Select, Dropdown, Checkbox).
2. **UI Generation**: The `FilterSidebar` component receives these extracted questions and renders a vertical sidebar with dropdowns for each filterable dimension.
3. **Cross-Tabulation**: When an administrator selects a filter (e.g. stage = "Discovery"), the dashboard triggers a request to the backend with these parameters. The backend then filters the raw DynamoDB responses before aggregating the results, allowing for precise cross-tabulation analysis.

### Usage Example

```tsx
import { extractFilterableQuestions } from '@survey-kit/core'
import { FilterSidebar } from '@survey-kit/registry'
import surveyConfig from './survey.json'

const filters = extractFilterableQuestions(surveyConfig)

// In your component
;<FilterSidebar
  filters={filters}
  activeFilters={activeFilters}
  onFilterChange={handleFilterChange}
/>
```

This ensures that your dashboards are always in sync with your survey design, automatically updating whenever you add or modify questions in your survey configuration.

## Survey scope

The template’s `dashboards/dashboard.config.json` may define a top-level `surveyFilter` (`label` plus `options` with `value` and `label`). `DashboardRenderer` then shows a dropdown under the dashboard title. Your app should map the selected `value` to the `surveyId` query parameter on `GET /api/admin/analytics`. Use an empty string for `value` for an “all surveys” option—the template omits `surveyId` in that case. Add or adjust options whenever you introduce new surveys; each `value` should match the id your API expects.

```json
"surveyFilter": {
  "label": "Survey",
  "options": [
    { "value": "", "label": "All surveys" },
    { "value": "survey-1", "label": "Main survey" }
  ]
}
```
