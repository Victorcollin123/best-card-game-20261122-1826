// Screenshot presets for Ember Court (?shot=title|play|win|loss&seed=N).
// Every preset reaches its screen by actually playing the game through the
// rules engine with a fixed seed — no staged DOM, no fake state. A win or
// loss screen is the true end of a simulated duel; the table shot is a real
// mid-duel moment after three settled rounds with a fourth round on the table.

import { isOver, newGame, playCard, settleRound, startDuel } from './state.js';

function lowestCard(hand) {
  return [...hand].sort((a, b) => a.value - b.value)[0];
}

function highestCard(hand) {
  return [...hand].sort((a, b) => b.value - a.value)[0];
}

function middleCard(hand) {
  return [...hand].sort((a, b) => a.value - b.value)[Math.floor(hand.length / 2)];
}

function playOneRound(state, pick) {
  const card = pick(state.playerHand);
  if (!card) return false;
  playCard(state, card.id);
  settleRound(state);
  return true;
}

function simulateGame(seed, pick) {
  const state = newGame(seed);
  startDuel(state);
  let guard = 0;
  while (!isOver(state) && guard < 80) {
    if (!playOneRound(state, pick)) break;
    guard++;
  }
  return state;
}

function simulateToOutcome(outcome, seeds, pick) {
  for (const seed of seeds) {
    const state = simulateGame(seed, pick);
    if (state.phase === outcome) return state;
  }
  return null;
}

function simulateTable(seed) {
  const state = newGame(seed);
  startDuel(state);
  let guard = 0;
  while (state.roundsPlayed < 3 && !isOver(state) && guard < 10) {
    if (!playOneRound(state, middleCard)) break;
    guard++;
  }
  // Fourth round: cards on the table, not yet settled.
  if (!isOver(state) && state.phase === 'playing') {
    playCard(state, middleCard(state.playerHand).id);
  }
  return state;
}

export function applyShot(shot, seed) {
  if (shot === 'title') return newGame(seed);
  if (shot === 'play') return simulateTable(seed);
  if (shot === 'win') {
    return simulateToOutcome('won', [seed, 7, 21, 42, 99, 123, 5, 13, 77], highestCard);
  }
  if (shot === 'loss') {
    return simulateToOutcome('lost', [seed, 7, 21, 42, 99, 123, 5, 13, 77], lowestCard);
  }
  return null;
}
