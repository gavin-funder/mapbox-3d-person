import type { GameState } from './types';

export function setupKeyboardInput(state: GameState): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    state.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
      e.preventDefault();
      state.keys['space'] = true;
    }
    if (e.key === 'Shift') state.keys['shift'] = true;
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    state.keys[e.key.toLowerCase()] = false;
    if (e.key === ' ') state.keys['space'] = false;
    if (e.key === 'Shift') state.keys['shift'] = false;
  });
}
