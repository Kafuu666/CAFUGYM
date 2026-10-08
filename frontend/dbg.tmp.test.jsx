import { it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './src/App';
it('dbg', async () => {
  const u = userEvent.setup();
  render(<App />);
  await u.type(await screen.findByLabelText('Email'), 'cafu@gmail.com');
  await u.type(screen.getByLabelText('Password'), 'salah');
  await u.click(screen.getByRole('button', { name: 'Masuk' }));
  await new Promise((r) => setTimeout(r, 1500));
  console.log('ALERT:', document.querySelector('[role=alert]')?.textContent, '| BODY:', document.body.textContent.slice(0, 200));
});
