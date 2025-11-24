import type { SurveyQuestion, ValidationRule } from '../types/survey'

/**
 * Validates a question's answer against all validation rules
 * @param question The question configuration
 * @param answer The answer value to validate
 * @param allAnswers All answers in the survey (for cross-question validation)
 * @returns Array of error messages (empty if valid)
 */
export function validateQuestion(
  question: SurveyQuestion,
  answer: unknown,
  allAnswers?: Record<string, unknown>
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
          case 'crossQuestion':
            if (rule.questionId && allAnswers && rule.operator) {
              const otherAnswer = allAnswers[rule.questionId]
              if (otherAnswer !== null && otherAnswer !== undefined) {
                const isValid = compareValues(
                  answer,
                  otherAnswer,
                  rule.operator
                )
                if (!isValid) {
                  errors.push(
                    rule.message ||
                      `This value must be ${getOperatorDescription(rule.operator)} the value of ${rule.questionId}`
                  )
                }
              }
            }
            break
          case 'dateRange':
            if (rule.questionId && allAnswers && rule.operator) {
              const otherAnswer = allAnswers[rule.questionId]
              if (otherAnswer) {
                const date1 = new Date(String(answer))
                const date2 = new Date(String(otherAnswer))
                const isValid = compareDates(date1, date2, rule.operator)
                if (!isValid) {
                  errors.push(
                    rule.message ||
                      `This date must be ${getOperatorDescription(rule.operator)} ${rule.questionId}`
                  )
                }
              }
            }
            break
          case 'numberRange':
            if (rule.questionId && allAnswers && rule.operator) {
              const otherAnswer = allAnswers[rule.questionId]
              if (otherAnswer !== null && otherAnswer !== undefined) {
                const num1 = Number(answer)
                const num2 = Number(otherAnswer)
                if (!isNaN(num1) && !isNaN(num2)) {
                  const isValid = compareNumbers(num1, num2, rule.operator)
                  if (!isValid) {
                    errors.push(
                      rule.message ||
                        `This number must be ${getOperatorDescription(rule.operator)} ${rule.questionId}`
                    )
                  }
                }
              }
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
 * Compare two values based on operator
 */
function compareValues(
  value1: unknown,
  value2: unknown,
  operator: string
): boolean {
  switch (operator) {
    case 'equals':
      return value1 === value2
    case 'notEquals':
      return value1 !== value2
    case 'greaterThan':
      return Number(value1) > Number(value2)
    case 'lessThan':
      return Number(value1) < Number(value2)
    case 'greaterThanOrEqual':
      return Number(value1) >= Number(value2)
    case 'lessThanOrEqual':
      return Number(value1) <= Number(value2)
    default:
      return true
  }
}

/**
 * Compare two dates based on operator
 */
function compareDates(date1: Date, date2: Date, operator: string): boolean {
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return true

  switch (operator) {
    case 'greaterThan':
      return date1 > date2
    case 'lessThan':
      return date1 < date2
    case 'greaterThanOrEqual':
      return date1 >= date2
    case 'lessThanOrEqual':
      return date1 <= date2
    case 'equals':
      return date1.getTime() === date2.getTime()
    case 'notEquals':
      return date1.getTime() !== date2.getTime()
    default:
      return true
  }
}

/**
 * Compare two numbers based on operator
 */
function compareNumbers(num1: number, num2: number, operator: string): boolean {
  switch (operator) {
    case 'equals':
      return num1 === num2
    case 'notEquals':
      return num1 !== num2
    case 'greaterThan':
      return num1 > num2
    case 'lessThan':
      return num1 < num2
    case 'greaterThanOrEqual':
      return num1 >= num2
    case 'lessThanOrEqual':
      return num1 <= num2
    default:
      return true
  }
}

/**
 * Get human-readable description of operator
 */
function getOperatorDescription(operator: string): string {
  switch (operator) {
    case 'equals':
      return 'equal to'
    case 'notEquals':
      return 'not equal to'
    case 'greaterThan':
      return 'greater than'
    case 'lessThan':
      return 'less than'
    case 'greaterThanOrEqual':
      return 'greater than or equal to'
    case 'lessThanOrEqual':
      return 'less than or equal to'
    default:
      return operator
  }
}

/**
 * Checks if a question's answer is valid for navigation purposes
 * Only checks requiredToNavigate questions and their validation
 * @param question The question configuration
 * @param answer The answer value to validate
 * @param allAnswers All answers in the survey (for cross-question validation)
 * @returns true if answer is valid for navigation, false otherwise
 */
export function isValidForNavigation(
  question: SurveyQuestion,
  answer: unknown,
  allAnswers?: Record<string, unknown>
): boolean {
  // If not required to navigate, it's always valid
  if (!question.requiredToNavigate) {
    return true
  }

  // Check if answer exists and is valid
  const errors = validateQuestion(question, answer, allAnswers)
  return errors.length === 0
}
