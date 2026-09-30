import { describe, expect, it } from 'vitest';
import { CardSchema, DECK_IDS } from '../core/types';
import { activities, cards, CONTENT_VERSION, decks, normalizePrompt, questions, validateContent } from './cards';

describe('published original card collection', () => {
  it('contains the complete validated content release', () => {
    expect(CONTENT_VERSION).toBe(1);
    expect(cards).toHaveLength(264);
    expect(questions).toHaveLength(240);
    expect(activities).toHaveLength(24);
    expect(validateContent()).toEqual([]);
    expect(cards.every((card) => CardSchema.safeParse(card).success)).toBe(true);
  });

  it('preserves forty explicit, stable question IDs in each of the six decks', () => {
    expect(decks.map((deck) => deck.id)).toEqual([...DECK_IDS]);
    for (const deckId of DECK_IDS) {
      const deckQuestions = questions.filter((card) => card.deckId === deckId);
      expect(deckQuestions).toHaveLength(40);
      expect(deckQuestions.map((card) => card.id)).toEqual(
        Array.from({ length: 40 }, (_, index) => `${deckId}-${String(index + 1).padStart(2, '0')}`),
      );
      expect(deckQuestions.slice(0, 6).every((card) => card.depth === 1)).toBe(true);
    }
    expect(new Set(cards.map((card) => card.id)).size).toBe(264);
  });

  it('has no normalized duplicate prompts and keeps prompts readable on small cards', () => {
    expect(new Set(cards.map((card) => normalizePrompt(card.prompt))).size).toBe(264);
    expect(questions.every((card) => card.prompt.trim().split(/\s+/).length <= 32)).toBe(true);
    expect(questions.every((card) => card.prompt.endsWith('?'))).toBe(true);
    expect(normalizePrompt('  What’s   LOVELY, today? ')).toBe(normalizePrompt('whats lovely today'));
  });

  it('supports a twelve-question session for every nonempty deck mix and comfort level', () => {
    for (let mask = 1; mask < 1 << DECK_IDS.length; mask += 1) {
      const selected = DECK_IDS.filter((_, index) => mask & (1 << index));
      for (const maxDepth of [1, 2, 3]) {
        const eligible = questions.filter((card) => selected.includes(card.deckId) && card.depth <= maxDepth);
        expect(eligible.length).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it('keeps optional activities separate and follow-ups within explicit depth metadata', () => {
    expect(questions.every((card) => card.kind === 'question')).toBe(true);
    expect(activities.every((card) => card.kind === 'activity')).toBe(true);
    expect(activities.map((card) => card.id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `moment-${String(index + 1).padStart(2, '0')}`),
    );
    const withFollowUps = questions.filter((card) => card.followUp);
    expect(withFollowUps.length).toBeGreaterThanOrEqual(80);
    expect(withFollowUps.every((card) => card.followUp && card.followUp.depth >= card.depth)).toBe(true);
  });

  it('rejects duplicate IDs, typography variants, missing fields, and invalid references', () => {
    const bad = structuredClone(cards) as unknown[];
    bad[1] = { ...cards[1], id: cards[0].id };
    bad[2] = { ...cards[2], prompt: `  ${cards[0].prompt.toUpperCase().replace('?', '!')}  ` };
    bad[3] = { ...cards[3], deckId: 'missing-deck' };
    bad[4] = { id: 'incomplete' };
    bad[5] = { ...cards[5], tags: [] };
    const errors = validateContent(bad);
    expect(errors.some((error) => error.includes('Duplicate card ID'))).toBe(true);
    expect(errors.some((error) => error.includes('Duplicate normalized prompt'))).toBe(true);
    expect(errors.filter((error) => error.includes('invalid required fields'))).toHaveLength(2);
    expect(errors.some((error) => error.includes('nonempty tags'))).toBe(true);
  });

  it('rejects incomplete collections and unusable light filters', () => {
    expect(validateContent(cards.slice(1)).some((error) => error.includes('264'))).toBe(true);
    const withoutLightLaughs = cards.map((card) => card.deckId === 'laughs' && card.kind === 'question'
      ? { ...card, depth: 3, followUp: undefined } : card);
    expect(validateContent(withoutLightLaughs).some((error) => error.includes('maximum depth 1'))).toBe(true);
  });
});
