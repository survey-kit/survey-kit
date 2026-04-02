/**
 * Unit tests for @survey-kit/core conditional logic.
 *
 * Tests evaluateCondition, evaluateConditions, shouldShowQuestion,
 * shouldShowPage, shouldShowGroup, and shouldShowStage using
 * scenarios extracted from survey-1.json.
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateCondition,
  evaluateConditions,
  shouldShowQuestion,
  shouldShowPage,
  shouldShowGroup,
  shouldShowStage,
} from '@survey-kit/core'
import type { SurveyConfig } from '@survey-kit/core'
import surveyConfig from '../../src/surveys/survey-1.json'

const config = surveyConfig as unknown as SurveyConfig

// Helper to extract entities from the real config

function findQuestion(questionId: string) {
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

function findPage(pageId: string) {
  for (const stage of config.stages) {
    for (const group of stage.groups) {
      const p = group.pages.find((p) => p.id === pageId)
      if (p) return p
    }
  }
  throw new Error(`Page "${pageId}" not found in survey-1.json`)
}

function findGroup(groupId: string) {
  for (const stage of config.stages) {
    const g = stage.groups.find((g) => g.id === groupId)
    if (g) return g
  }
  throw new Error(`Group "${groupId}" not found in survey-1.json`)
}

function findStage(stageId: string) {
  const s = config.stages.find((s) => s.id === stageId)
  if (!s) throw new Error(`Stage "${stageId}" not found in survey-1.json`)
  return s
}

// evaluateCondition

describe('evaluateCondition', () => {
  it('returns true when equals condition is met', () => {
    expect(
      evaluateCondition(
        { questionId: 'response_depth', operator: 'equals', value: 'deep' },
        { response_depth: 'deep' }
      )
    ).toBe(true)
  })

  it('returns false when equals condition is not met', () => {
    expect(
      evaluateCondition(
        { questionId: 'response_depth', operator: 'equals', value: 'deep' },
        { response_depth: 'brief' }
      )
    ).toBe(false)
  })

  it('returns true when notEquals condition is met', () => {
    expect(
      evaluateCondition(
        { questionId: 'response_depth', operator: 'notEquals', value: 'deep' },
        { response_depth: 'brief' }
      )
    ).toBe(true)
  })

  it('returns false when notEquals condition is not met', () => {
    expect(
      evaluateCondition(
        { questionId: 'response_depth', operator: 'notEquals', value: 'deep' },
        { response_depth: 'deep' }
      )
    ).toBe(false)
  })

  it('handles array values (checkbox) with equals', () => {
    expect(
      evaluateCondition(
        { questionId: 'interests', operator: 'equals', value: 'docs' },
        { interests: ['docs', 'training'] }
      )
    ).toBe(true)
  })

  it('returns false for array values when value is not in array', () => {
    expect(
      evaluateCondition(
        { questionId: 'interests', operator: 'equals', value: 'docs' },
        { interests: ['training', 'events'] }
      )
    ).toBe(false)
  })

  it('handles array values with notEquals', () => {
    expect(
      evaluateCondition(
        { questionId: 'interests', operator: 'notEquals', value: 'docs' },
        { interests: ['training', 'events'] }
      )
    ).toBe(true)
  })

  it('handles undefined answer values', () => {
    expect(
      evaluateCondition(
        { questionId: 'response_depth', operator: 'equals', value: 'deep' },
        {}
      )
    ).toBe(false)
  })
})

// evaluateConditions

describe('evaluateConditions', () => {
  it('returns true for empty conditions array', () => {
    expect(evaluateConditions([], {})).toBe(true)
  })

  it('AND logic: all conditions must be true', () => {
    const conditions = [
      {
        questionId: 'consent_followup_a',
        operator: 'equals' as const,
        value: 'yes',
      },
      {
        questionId: 'consent_followup_b',
        operator: 'equals' as const,
        value: 'yes',
      },
    ]
    expect(
      evaluateConditions(
        conditions,
        {
          consent_followup_a: 'yes',
          consent_followup_b: 'yes',
        },
        'AND'
      )
    ).toBe(true)
  })

  it('AND logic: fails if any condition is false', () => {
    const conditions = [
      {
        questionId: 'consent_followup_a',
        operator: 'equals' as const,
        value: 'yes',
      },
      {
        questionId: 'consent_followup_b',
        operator: 'equals' as const,
        value: 'yes',
      },
    ]
    expect(
      evaluateConditions(
        conditions,
        {
          consent_followup_a: 'yes',
          consent_followup_b: 'no',
        },
        'AND'
      )
    ).toBe(false)
  })

  it('OR logic: passes if at least one condition is true', () => {
    const conditions = [
      {
        questionId: 'response_depth',
        operator: 'equals' as const,
        value: 'brief',
      },
      {
        questionId: 'response_depth',
        operator: 'equals' as const,
        value: 'standard',
      },
    ]
    expect(
      evaluateConditions(conditions, { response_depth: 'brief' }, 'OR')
    ).toBe(true)
  })

  it('OR logic: fails if no conditions are true', () => {
    const conditions = [
      {
        questionId: 'response_depth',
        operator: 'equals' as const,
        value: 'brief',
      },
      {
        questionId: 'response_depth',
        operator: 'equals' as const,
        value: 'standard',
      },
    ]
    expect(
      evaluateConditions(conditions, { response_depth: 'deep' }, 'OR')
    ).toBe(false)
  })
})

// shouldShowQuestion

describe('shouldShowQuestion', () => {
  it('always shows questions without conditional logic', () => {
    const q = findQuestion('respondent_name')
    expect(shouldShowQuestion(q, {})).toBe(true)
  })

  it('shows deep_dive_notes only when response_depth === "deep"', () => {
    const q = findQuestion('deep_dive_notes')
    expect(shouldShowQuestion(q, { response_depth: 'deep' })).toBe(true)
    expect(shouldShowQuestion(q, { response_depth: 'brief' })).toBe(false)
    expect(shouldShowQuestion(q, {})).toBe(false)
  })

  it('shows brief_or_standard_tip with OR logic (brief OR standard)', () => {
    const q = findQuestion('brief_or_standard_tip')
    expect(shouldShowQuestion(q, { response_depth: 'brief' })).toBe(true)
    expect(shouldShowQuestion(q, { response_depth: 'standard' })).toBe(true)
    expect(shouldShowQuestion(q, { response_depth: 'deep' })).toBe(false)
  })

  it('shows not_deep_comment with notEquals "deep"', () => {
    const q = findQuestion('not_deep_comment')
    expect(shouldShowQuestion(q, { response_depth: 'brief' })).toBe(true)
    expect(shouldShowQuestion(q, { response_depth: 'standard' })).toBe(true)
    expect(shouldShowQuestion(q, { response_depth: 'deep' })).toBe(false)
  })

  it('shows dual_opt_in_detail only when BOTH consents are "yes" (AND)', () => {
    const q = findQuestion('dual_opt_in_detail')
    expect(
      shouldShowQuestion(q, {
        consent_followup_a: 'yes',
        consent_followup_b: 'yes',
      })
    ).toBe(true)
    expect(
      shouldShowQuestion(q, {
        consent_followup_a: 'yes',
        consent_followup_b: 'no',
      })
    ).toBe(false)
    expect(
      shouldShowQuestion(q, {
        consent_followup_a: 'no',
        consent_followup_b: 'yes',
      })
    ).toBe(false)
  })
})

// shouldShowPage

describe('shouldShowPage', () => {
  it('always shows pages without conditional logic', () => {
    const page = findPage('page-primary-contact')
    expect(shouldShowPage(page, {})).toBe(true)
  })

  it('shows page-east-overlay only when region === "east"', () => {
    const page = findPage('page-east-overlay')
    expect(shouldShowPage(page, { region: 'east' })).toBe(true)
    expect(shouldShowPage(page, { region: 'north' })).toBe(false)
    expect(shouldShowPage(page, {})).toBe(false)
  })
})

// shouldShowGroup

describe('shouldShowGroup', () => {
  it('always shows groups without conditional logic', () => {
    const group = findGroup('group-inputs')
    expect(shouldShowGroup(group, {})).toBe(true)
  })

  it('shows group-docs-follow-up only when interests includes "docs"', () => {
    const group = findGroup('group-docs-follow-up')
    expect(shouldShowGroup(group, { interests: ['docs'] })).toBe(true)
    expect(shouldShowGroup(group, { interests: ['training'] })).toBe(false)
    expect(shouldShowGroup(group, { interests: [] })).toBe(false)
    expect(shouldShowGroup(group, {})).toBe(false)
  })
})

// shouldShowStage

describe('shouldShowStage', () => {
  it('always shows stages without conditional logic', () => {
    const stage = findStage('stage-basics')
    expect(shouldShowStage(stage, {})).toBe(true)
  })

  it('shows stage-bonus only when enroll_bonus_stage === "yes"', () => {
    const stage = findStage('stage-bonus')
    expect(shouldShowStage(stage, { enroll_bonus_stage: 'yes' })).toBe(true)
    expect(shouldShowStage(stage, { enroll_bonus_stage: 'no' })).toBe(false)
    expect(shouldShowStage(stage, {})).toBe(false)
  })
})
