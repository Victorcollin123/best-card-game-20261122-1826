// Input for Ember Court: mouse clicks and keyboard, both driving the same
// handful of actions. Keys: 1-5 pick a card, Enter/Space begins or plays,
// R duels again on an end screen, M toggles sound, Esc clears the pick.

export function bindInput(actions) {
  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key;
    if (key >= '1' && key <= '5') {
      actions.onPickIndex(Number(key) - 1);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      actions.onConfirm();
      return;
    }
    if (key === 'Escape') {
      actions.onClearPick();
      return;
    }
    if (key === 'r' || key === 'R') {
      actions.onRestart();
      return;
    }
    if (key === 'm' || key === 'M') {
      actions.onToggleMute();
    }
  });

  document.getElementById('play-btn').addEventListener('click', () => actions.onConfirm());
  document.getElementById('mute-btn').addEventListener('click', () => actions.onToggleMute());
}
