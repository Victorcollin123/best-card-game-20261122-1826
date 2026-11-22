// The Ember Court deck: 32 cards, four original suits in a ring, values 1-8.
// Suits are told apart by colour AND shape, never by text alone:
//   Ember ▲ red-orange, Tide ● blue, Thorn ◆ green, Star ★ gold.

import { shuffleInPlace } from './random.js';

export const SUITS = {
  ember: { key: 'ember', name: 'Ember', glyph: '▲', ringBeats: 'thorn', colour: '#c22e12' },
  tide: { key: 'tide', name: 'Tide', glyph: '●', ringBeats: 'star', colour: '#0d5aa8' },
  thorn: { key: 'thorn', name: 'Thorn', glyph: '◆', ringBeats: 'tide', colour: '#1e7a34' },
  star: { key: 'star', name: 'Star', glyph: '★', ringBeats: 'ember', colour: '#a06a00' },
};

export const SUIT_KEYS = ['ember', 'tide', 'thorn', 'star'];
export const MAX_VALUE = 8;
export const HAND_SIZE = 5;
export const START_LIFE = 20;

let serial = 0;

export function buildDeck() {
  const deck = [];
  for (const suit of SUIT_KEYS) {
    for (let value = 1; value <= MAX_VALUE; value++) {
      deck.push({ id: `c${serial++}`, suit, value });
    }
  }
  return deck;
}

export function freshDecks(rng) {
  const deck = shuffleInPlace(buildDeck(), rng);
  return deck;
}

// Draw one card, reshuffling the discard pile when the deck runs dry.
// Returns null only when deck and discard are both empty (game is then over).
export function drawCard(deck, discard, rng) {
  if (deck.length === 0) {
    if (discard.length === 0) return null;
    while (discard.length > 0) deck.push(discard.pop());
    shuffleInPlace(deck, rng);
  }
  return deck.pop();
}

export function suitOf(card) {
  return SUITS[card.suit];
}

export function cardLabel(card) {
  return `${card.value} of ${SUITS[card.suit].name}`;
}
