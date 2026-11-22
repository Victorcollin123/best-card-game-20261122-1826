// Ember Court — boot. Wires state, rendering, input and sound together.
// Live play uses a fresh seed each duel; ?shot=title|play|win|loss&seed=N
// renders a fixed, reproducible screen for screenshots (see shots.js).

import { newGame, startDuel, playCard, settleRound, isOver } from './state.js';
import { renderTable, renderTitleScreen, renderEndScreen, hideOverlay, flashLife } from './render.js';
import { bindInput } from './input.js';
import {
  isMuted, toggleMute, playFlipSound, playWinRoundSound, playLoseRoundSound,
  playVictorySound, playDefeatSound,
} from './audio.js';
import { applyShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) ? seedParam : (Date.now() % 2147483647);

let state = shotName ? applyShot(shotName, seed) || newGame(seed) : newGame(seed);
const ui = { selectedId: null, onPickCard: pickCard };

function refreshMuteButton() {
  document.getElementById('mute-btn').textContent = isMuted() ? 'SOUND OFF' : 'SOUND ON';
}

function pickCard(cardId) {
  if (state.phase !== 'playing') return;
  ui.selectedId = ui.selectedId === cardId ? null : cardId;
  playFlipSound();
  renderTable(state, ui);
}

function playSelected() {
  if (state.phase !== 'playing' || !ui.selectedId) return;
  const resolution = playCard(state, ui.selectedId);
  if (!resolution) return;
  ui.selectedId = null;
  playFlipSound();
  renderTable(state, ui);
  setTimeout(() => {
    const before = { player: state.playerLife, rival: state.rivalLife };
    settleRound(state);
    if (state.playerLife < before.player) flashLife('player');
    if (state.rivalLife < before.rival) flashLife('rival');
    if (state.phase === 'won') {
      playVictorySound();
      renderEndScreen(state, restart);
    } else if (state.phase === 'lost') {
      playDefeatSound();
      renderEndScreen(state, restart);
    } else {
      if (resolution.winner === 'player') playWinRoundSound();
      if (resolution.winner === 'rival') playLoseRoundSound();
      renderTable(state, ui);
    }
  }, 950);
}

function begin() {
  hideOverlay();
  startDuel(state);
  renderTable(state, ui);
}

function restart() {
  const freshSeed = shotName ? seed : (Date.now() % 2147483647);
  state = shotName ? applyShot(shotName, freshSeed) || newGame(freshSeed) : newGame(freshSeed);
  ui.selectedId = null;
  drawShotScreen();
}

function drawShotScreen() {
  if (shotName === 'title') {
    renderTitleScreen(state, begin);
    return;
  }
  if (isOver(state)) {
    renderEndScreen(state, restart);
    return;
  }
  if (state.phase === 'title') {
    renderTitleScreen(state, begin);
    return;
  }
  hideOverlay();
  renderTable(state, ui);
}

bindInput({
  onPickIndex(index) {
    if (state.phase !== 'playing') return;
    const card = state.playerHand[index];
    if (card) pickCard(card.id);
  },
  onConfirm() {
    if (state.phase === 'title') { begin(); return; }
    if (isOver(state)) { restart(); return; }
    playSelected();
  },
  onClearPick() {
    ui.selectedId = null;
    renderTable(state, ui);
  },
  onRestart() {
    if (isOver(state) || state.phase === 'title') restart();
  },
  onToggleMute() {
    toggleMute();
    refreshMuteButton();
  },
});

refreshMuteButton();
drawShotScreen();

// Exposed for play-testing in a console: window.__emberCourt.state
window.__emberCourt = { get state() { return state; } };
