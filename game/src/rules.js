// The duel rules of Ember Court. One round, both sides play one card:
//   - Higher value wins the round; the winner deals damage equal to the difference.
//   - The winner's suit beating the loser's suit in the ring adds +2 damage.
//   - Tied values: the suit ring decides, and the ring winner deals 2 damage.
//   - Same suit and same value: a dead heat, both duelists take 1 damage.
// The ring: Ember beats Thorn, Thorn beats Tide, Tide beats Star, Star beats Ember.

import { SUITS } from './deck.js';

export const RING_BONUS = 2;
export const TIE_RING_DAMAGE = 2;
export const DEAD_HEAT_DAMAGE = 1;

export function ringBeats(attackerSuit, defenderSuit) {
  return SUITS[attackerSuit].ringBeats === defenderSuit;
}

export function resolveRound(playerCard, rivalCard) {
  if (playerCard.value > rivalCard.value) {
    const bonus = ringBeats(playerCard.suit, rivalCard.suit) ? RING_BONUS : 0;
    return {
      winner: 'player', playerDamage: 0, rivalDamage: playerCard.value - rivalCard.value + bonus,
      ringBonus: bonus > 0,
      text: `Your <b>${playerCard.value}</b> beats Sable's <b>${rivalCard.value}</b> — Sable takes <b>${playerCard.value - rivalCard.value + bonus}</b> damage${bonus ? ' (ring bonus +2)' : ''}.`,
    };
  }
  if (rivalCard.value > playerCard.value) {
    const bonus = ringBeats(rivalCard.suit, playerCard.suit) ? RING_BONUS : 0;
    return {
      winner: 'rival', playerDamage: rivalCard.value - playerCard.value + bonus, rivalDamage: 0,
      ringBonus: bonus > 0,
      text: `Sable's <b>${rivalCard.value}</b> beats your <b>${playerCard.value}</b> — you take <b>${rivalCard.value - playerCard.value + bonus}</b> damage${bonus ? ' (ring bonus +2)' : ''}.`,
    };
  }
  // Equal values: the suit ring decides.
  if (ringBeats(playerCard.suit, rivalCard.suit)) {
    return {
      winner: 'player', playerDamage: 0, rivalDamage: TIE_RING_DAMAGE, ringBonus: true,
      text: `Tied at <b>${playerCard.value}</b> — your ${SUITS[playerCard.suit].name} beats Sable's ${SUITS[rivalCard.suit].name} in the ring. Sable takes <b>2</b> damage.`,
    };
  }
  if (ringBeats(rivalCard.suit, playerCard.suit)) {
    return {
      winner: 'rival', playerDamage: TIE_RING_DAMAGE, rivalDamage: 0, ringBonus: true,
      text: `Tied at <b>${playerCard.value}</b> — Sable's ${SUITS[rivalCard.suit].name} beats your ${SUITS[playerCard.suit].name} in the ring. You take <b>2</b> damage.`,
    };
  }
  return {
    winner: 'none', playerDamage: DEAD_HEAT_DAMAGE, rivalDamage: DEAD_HEAT_DAMAGE, ringBonus: false,
    text: `Dead heat — identical cards. Both duelists take <b>1</b> damage.`,
  };
}
