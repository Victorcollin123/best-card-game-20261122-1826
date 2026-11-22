// Rendering for Ember Court: builds the table's DOM from the state and nothing
// else. Cards are real DOM elements so their values and suits stay crisp at
// thumbnail size; animations are CSS classes, so a screenshot always catches
// the settled frame.

import { SUITS } from './deck.js';

const $ = (id) => document.getElementById(id);

function cardElement(card, faceUp) {
  const el = document.createElement('div');
  if (!faceUp) {
    el.className = 'card back';
    el.innerHTML = '<div class="back-mark">♛</div>';
    return el;
  }
  const suit = SUITS[card.suit];
  el.className = `card suit-${card.suit}`;
  el.dataset.cardId = card.id;
  el.innerHTML =
    `<div class="rank">${card.value}</div>` +
    `<div class="cost">${card.value}</div>` +
    `<div class="suit-glyph">${suit.glyph}</div>` +
    `<div class="suit-name">${suit.name.toUpperCase()}</div>` +
    `<div class="rank-small">${card.value}</div>`;
  return el;
}

function renderHand(container, cards, faceUp, selectedId, onPick) {
  container.innerHTML = '';
  for (const card of cards) {
    const el = cardElement(card, faceUp);
    if (faceUp && onPick) {
      el.addEventListener('click', () => onPick(card.id));
      if (card.id === selectedId) el.classList.add('selected');
    }
    container.appendChild(el);
  }
}

function renderSlot(container, card, label, glow) {
  container.innerHTML = '';
  if (!card) {
    const empty = document.createElement('div');
    empty.className = 'slot-empty';
    empty.textContent = label;
    container.appendChild(empty);
    return;
  }
  const el = cardElement(card, true);
  el.classList.add('flip-in');
  if (glow === 'win') el.classList.add('winner-glow');
  if (glow === 'lose') el.classList.add('loser-dim');
  container.appendChild(el);
}

function setLife(numEl, fillEl, life) {
  numEl.textContent = String(life);
  fillEl.style.width = `${(life / 20) * 100}%`;
}

export function renderTable(state, ui) {
  $('round-num').textContent = String(state.round);
  setLife($('player-life'), $('player-life-fill'), state.playerLife);
  setLife($('rival-life'), $('rival-life-fill'), state.rivalLife);
  $('deck-count').textContent = String(state.deck.length);
  $('rival-hand-count').textContent = String(state.rivalHand.length);
  $('damage-dealt').textContent = String(state.damageDealt);
  $('damage-taken').textContent = String(state.damageTaken);
  $('round-result').innerHTML = state.lastResult || 'Choose a card to duel.';

  renderHand($('rival-hand'), state.rivalHand, false, null, null);
  renderHand($('player-hand'), state.playerHand, true, ui.selectedId, ui.onPickCard);

  const table = state.table;
  let playerGlow = null;
  let rivalGlow = null;
  if (table && state.lastResolution) {
    if (state.lastResolution.winner === 'player') { playerGlow = 'win'; rivalGlow = 'lose'; }
    if (state.lastResolution.winner === 'rival') { rivalGlow = 'win'; playerGlow = 'lose'; }
  }
  renderSlot($('played-player'), table ? table.player : null, 'YOUR CARD', playerGlow);
  renderSlot($('played-rival'), table ? table.rival : null, "SABLE'S CARD", rivalGlow);

  $('play-btn').disabled = !(state.phase === 'playing' && ui.selectedId);
}

function showOverlay(kind, kicker, title, text, stats, btnLabel, hint) {
  const overlay = $('overlay');
  const card = $('overlay-card');
  card.classList.toggle('lost', kind === 'lost');
  $('overlay-kicker').textContent = kicker;
  $('overlay-title').textContent = title;
  $('overlay-text').innerHTML = text;
  $('overlay-stats').innerHTML = stats;
  const btn = $('overlay-btn');
  btn.textContent = btnLabel;
  $('overlay-hint').textContent = hint;
  overlay.classList.remove('hidden');
  return btn;
}

export function hideOverlay() {
  $('overlay').classList.add('hidden');
}

export function renderTitleScreen(state, onBegin) {
  renderTable(state, { selectedId: null, onPickCard: null });
  showOverlay(
    'title',
    'A DUEL OF SUITS · FIRST TO ZERO LIFE LOSES',
    'EMBER COURT',
    'Higher value wins the round and deals damage equal to the difference. ' +
      'On a tied value the suit ring decides: <span class="suit-key">Ember ▲ beats Thorn ◆, ' +
      'Thorn ◆ beats Tide ●, Tide ● beats Star ★, Star ★ beats Ember ▲</span> — and the ring ' +
      'winner deals 2. A ring win on a higher value adds +2 damage. Same suit, same value: ' +
      'both take 1. Your hand refills to five after every round.',
    'You start at <b>20 life</b> · Sable starts at <b>20 life</b> · 32 cards, four suits',
    'BEGIN THE DUEL',
    'Click BEGIN, or press Enter. Keys 1–5 pick a card, Enter plays it.',
  ).onclick = onBegin;
}

export function renderEndScreen(state, onAgain) {
  renderTable(state, { selectedId: null, onPickCard: null });
  const won = state.phase === 'won';
  const stats =
    `Rounds played: <b>${state.roundsPlayed}</b> · Damage dealt: <b>${state.damageDealt}</b> · ` +
    `Damage taken: <b>${state.damageTaken}</b><br>Final life — You <b>${state.playerLife}</b> · Sable <b>${state.rivalLife}</b>`;
  showOverlay(
    won ? 'won' : 'lost',
    won ? 'THE COURT IS YOURS' : 'THE COURT FALLS SILENT',
    won ? 'VICTORY' : 'DEFEAT',
    won
      ? 'Sable bows her thorned crown and yields the table. Every card you saved, every ring you read — it all paid off.'
      : 'Sable takes the table this time. She plays her lowest winning card and saves her best for when it hurts — watch for it, and take the Court back.',
    stats,
    'DUEL AGAIN',
    'Click DUEL AGAIN, or press R.',
  ).onclick = onAgain;
}

export function flashLife(side) {
  const el = side === 'player' ? $('player-life') : $('rival-life');
  el.classList.remove('life-flash');
  void el.offsetWidth;
  el.classList.add('life-flash');
}
