import type { SurveyQuestion, ValidationRule } from '../types/survey'

/**
 * Validates a question's answer against all validation rules
 * @param question The question configuration
 * @param answer The answer value to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateQuestion(
  question: SurveyQuestion,
  answer: unknown
): string[] {
  const errors: string[] = []

  // Check if field is required (either required or requiredToNavigate)
  const isRequired = question.required || question.requiredToNavigate
  if (isRequired) {
    if (
      !answer ||
      answer === '' ||
      (Array.isArray(answer) && answer.length === 0)
    ) {
      errors.push(question.label + ' is required')
    }
  }

  // Apply validation rules if answer exists
  if (answer !== null && answer !== undefined && answer !== '') {
    if (question.validation) {
      question.validation.forEach((rule: ValidationRule) => {
        switch (rule.type) {
          case 'required':
            if (!answer || answer === '') {
              errors.push(rule.message || 'This field is required')
            }
            break
          case 'min':
            if (
              typeof answer === 'string' &&
              answer.length < (rule.value as number)
            ) {
              errors.push(
                rule.message || `Minimum ${rule.value} characters required`
              )
            }
            break
          case 'max':
            if (
              typeof answer === 'string' &&
              answer.length > (rule.value as number)
            ) {
              errors.push(
                rule.message || `Maximum ${rule.value} characters allowed`
              )
            }
            break
          case 'pattern':
            if (
              answer &&
              !new RegExp(rule.value as string).test(String(answer))
            ) {
              errors.push(rule.message || 'Invalid format')
            }
            break
          default:
            break
        }
      })
    }
  }

  return errors
}

/**
 * Checks if a question's answer is valid for navigation purposes
 * Only checks requiredToNavigate questions and their validation
 * @param question The question configuration
 * @param answer The answer value to validate
 * @returns true if answer is valid for navigation, false otherwise
 */
export function isValidForNavigation(
  question: SurveyQuestion,
  answer: unknown
): boolean {
  // If not required to navigate, it's always valid
  if (!question.requiredToNavigate) {
    return true
  }

  // Check if answer exists and is valid
  const errors = validateQuestion(question, answer)
  return errors.length === 0
}
