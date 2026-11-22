// Game state for Ember Court: one object, one job — hold the duel and move it
// forward one round at a time. Phases: title -> playing -> resolving -> won/lost.
// Rendering and input live elsewhere; this file never touches the DOM.

import { HAND_SIZE, START_LIFE, drawCard, freshDecks } from './deck.js';
import { makeRng } from './random.js';
import { resolveRound } from './rules.js';
import { chooseRivalCard } from './ai.js';

export function newGame(seed) {
  const rng = makeRng(seed);
  const deck = freshDecks(rng);
  const state = {
    seed,
    rng,
    phase: 'title',
    round: 1,
    playerLife: START_LIFE,
    rivalLife: START_LIFE,
    deck,
    discard: [],
    playerHand: [],
    rivalHand: [],
    table: null,
    lastResult: null,
    lastResolution: null,
    playerLastValue: null,
    damageDealt: 0,
    damageTaken: 0,
    roundsPlayed: 0,
  };
  for (let i = 0; i < HAND_SIZE; i++) {
    state.playerHand.push(drawCard(state.deck, state.discard, state.rng));
    state.rivalHand.push(drawCard(state.deck, state.discard, state.rng));
  }
  return state;
}

export function startDuel(state) {
  state.phase = 'playing';
  state.lastResult = 'The duel begins. Play your first card.';
}

function refillHand(state, hand) {
  while (hand.length < HAND_SIZE) {
    const card = drawCard(state.deck, state.discard, state.rng);
    if (!card) break;
    hand.push(card);
  }
}

export function playCard(state, cardId) {
  if (state.phase !== 'playing') return null;
  const index = state.playerHand.findIndex((c) => c && c.id === cardId);
  if (index < 0) return null;
  const playerCard = state.playerHand.splice(index, 1)[0];
  const rivalCard = chooseRivalCard(
    state.rivalHand, state.playerLastValue, state.rivalLife, state.playerLife, state.rng,
  );
  const rivalIndex = state.rivalHand.findIndex((c) => c.id === rivalCard.id);
  state.rivalHand.splice(rivalIndex, 1);
  state.table = { player: playerCard, rival: rivalCard };
  state.phase = 'resolving';
  state.lastResolution = resolveRound(playerCard, rivalCard);
  state.lastResult = state.lastResolution.text;
  return state.lastResolution;
}

export function settleRound(state) {
  if (state.phase !== 'resolving' || !state.lastResolution) return;
  const r = state.lastResolution;
  state.playerLife = Math.max(0, state.playerLife - r.playerDamage);
  state.rivalLife = Math.max(0, state.rivalLife - r.rivalDamage);
  state.damageDealt += r.rivalDamage;
  state.damageTaken += r.playerDamage;
  state.roundsPlayed += 1;
  state.playerLastValue = state.table.player.value;
  state.discard.push(state.table.player, state.table.rival);
  state.table = null;
  state.lastResolution = null;
  if (state.rivalLife <= 0 && state.playerLife <= 0) {
    state.phase = state.damageDealt >= state.damageTaken ? 'won' : 'lost';
  } else if (state.rivalLife <= 0) {
    state.phase = 'won';
  } else if (state.playerLife <= 0) {
    state.phase = 'lost';
  } else {
    refillHand(state, state.playerHand);
    refillHand(state, state.rivalHand);
    state.round += 1;
    state.phase = 'playing';
    state.lastResult = 'Choose your next card.';
  }
}

export function isOver(state) {
  return state.phase === 'won' || state.phase === 'lost';
}
