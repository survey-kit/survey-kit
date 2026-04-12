/**
 * Unit tests for @survey-kit/core validation logic.
 *
 * Tests validateQuestion and isValidForNavigation using
 * question definitions from survey-1.json.
 *
 * Note: validation functions are internal to core and not part of
 * the public barrel. We use the @core alias to reach them directly.
 */

import { describe, it, expect } from 'vitest'
import type { SurveyQuestion, SurveyConfig } from '@survey-kit/core'
import surveyConfig from '../../src/surveys/survey-1.json'

import {
  validateQuestion,
  isValidForNavigation,
} from '../../../core/src/lib/validation'

const config = surveyConfig as unknown as SurveyConfig

// Helper to find a question

function findQuestion(questionId: string): SurveyQuestion {
  for (const stage of config.stages) {
    for (const group of stage.groups) {
      for (const page of group.pages) {
        const q = page.questions.find((q) => q.id === questionId)
        if (q) return q
      }
    }
  }
  throw new Error(`Question "${questionId}" not found in survey-1.json`)
}

// validateQuestion

describe('validateQuestion', () => {
  describe('required fields', () => {
    it('returns error for empty required text field', () => {
      const q = findQuestion('respondent_name')
      const errors = validateQuestion(q, '')
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('required')
    })

    it('returns no error for filled required text field', () => {
      const q = findQuestion('respondent_name')
      const errors = validateQuestion(q, 'Alice')
      const requiredErrors = errors.filter((e: string) =>
        e.toLowerCase().includes('required')
      )
      expect(requiredErrors).toHaveLength(0)
    })

    it('returns error for empty required radio field', () => {
      const q = findQuestion('preferred_channel')
      const errors = validateQuestion(q, '')
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('min/max validation', () => {
    it('rejects name shorter than min (2 characters)', () => {
      const q = findQuestion('respondent_name')
      const errors = validateQuestion(q, 'A')
      expect(errors.some((e: string) => e.includes('2 characters'))).toBe(true)
    })

    it('accepts name at min length', () => {
      const q = findQuestion('respondent_name')
      const errors = validateQuestion(q, 'Al')
      expect(
        errors.filter((e: string) => e.includes('2 characters'))
      ).toHaveLength(0)
    })

    it('rejects name exceeding max (80 characters)', () => {
      const q = findQuestion('respondent_name')
      const errors = validateQuestion(q, 'A'.repeat(81))
      expect(errors.some((e: string) => e.includes('80 characters'))).toBe(true)
    })
  })

  describe('pattern validation', () => {
    it('rejects invalid email format', () => {
      const q = findQuestion('primary_email')
      const errors = validateQuestion(q, 'not-an-email')
      expect(
        errors.some((e: string) => e.toLowerCase().includes('email'))
      ).toBe(true)
    })

    it('accepts valid email format', () => {
      const q = findQuestion('primary_email')
      const errors = validateQuestion(q, 'test@example.com')
      expect(
        errors.filter((e: string) => e.toLowerCase().includes('email'))
      ).toHaveLength(0)
    })
  })

  describe('cross-question validation', () => {
    it('rejects mismatched email confirmation', () => {
      const q = findQuestion('confirm_email')
      const errors = validateQuestion(q, 'different@example.com', {
        primary_email: 'test@example.com',
      })
      expect(
        errors.some((e: string) => e.toLowerCase().includes('match'))
      ).toBe(true)
    })

    it('accepts matching email confirmation', () => {
      const q = findQuestion('confirm_email')
      const errors = validateQuestion(q, 'test@example.com', {
        primary_email: 'test@example.com',
      })
      expect(
        errors.filter((e: string) => e.toLowerCase().includes('match'))
      ).toHaveLength(0)
    })
  })

  describe('dateRange validation', () => {
    it('rejects end date before start date', () => {
      const q = findQuestion('window_end')
      const errors = validateQuestion(q, '2025-01-01', {
        window_start: '2025-06-01',
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('accepts end date on or after start date', () => {
      const q = findQuestion('window_end')
      const errors = validateQuestion(q, '2025-06-01', {
        window_start: '2025-01-01',
      })
      const dateErrors = errors.filter(
        (e: string) =>
          e.toLowerCase().includes('date') || e.toLowerCase().includes('after')
      )
      expect(dateErrors).toHaveLength(0)
    })
  })

  describe('numberRange validation', () => {
    it('rejects upper bound less than lower bound', () => {
      const q = findQuestion('budget_high')
      const errors = validateQuestion(q, '50', {
        budget_low: '100',
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('accepts upper bound greater than or equal to lower', () => {
      const q = findQuestion('budget_high')
      const errors = validateQuestion(q, '200', {
        budget_low: '100',
      })
      const rangeErrors = errors.filter(
        (e: string) =>
          e.toLowerCase().includes('greater') ||
          e.toLowerCase().includes('bound')
      )
      expect(rangeErrors).toHaveLength(0)
    })
  })
})

// isValidForNavigation

describe('isValidForNavigation', () => {
  it('returns true for non-requiredToNavigate questions', () => {
    const q = findQuestion('context_notes') // required: false
    expect(isValidForNavigation(q, '')).toBe(true)
  })

  it('returns false for empty requiredToNavigate field', () => {
    const q = findQuestion('respondent_name') // requiredToNavigate: true
    expect(isValidForNavigation(q, '')).toBe(false)
  })

  it('returns true for filled requiredToNavigate field', () => {
    const q = findQuestion('respondent_name')
    expect(isValidForNavigation(q, 'Alice')).toBe(true)
  })

  it('returns false for requiredToNavigate field with validation errors', () => {
    const q = findQuestion('primary_email') // requiredToNavigate + pattern
    expect(isValidForNavigation(q, 'not-an-email')).toBe(false)
  })

  it('returns true for requiredToNavigate field passing all validation', () => {
    const q = findQuestion('primary_email')
    expect(isValidForNavigation(q, 'test@example.com')).toBe(true)
  })
})
