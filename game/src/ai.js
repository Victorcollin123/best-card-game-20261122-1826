// Sable, the Thorn Queen: the AI rival. Her choices are readable on purpose —
// a player who watches her can counter her. Her rules, in order:
//   1. When her life is low (8 or less) she spends her best card to stay alive.
//   2. Otherwise she plays her lowest card that still beats the player's last
//      played value, saving her high cards for later rounds.
//   3. When nothing in hand beats that value, she plays her lowest card and
//      banks on the suit ring to steal the tie.
//   4. Rarely (1 in 6), when ahead on life, she gambles her best card to press.

import { ringBeats } from './rules.js';

export function chooseRivalCard(hand, playerLastValue, rivalLife, playerLife, rng) {
  if (hand.length === 0) return null;
  const sorted = [...hand].sort((a, b) => a.value - b.value || (ringBeats(a.suit, b.suit) ? -1 : 1));
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  if (rivalLife <= 8) return highest;

  if (playerLife < rivalLife && rng() < 1 / 6) return highest;

  if (playerLastValue != null) {
    const beaters = sorted.filter((c) => c.value > playerLastValue);
    if (beaters.length > 0) return beaters[0];
  }
  // No beater, or no read on the player: spend the cheapest card.
  // Her cheapest card still threatens a ring win on a tied value.
  return lowest;
}
