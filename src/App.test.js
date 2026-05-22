import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders store name', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const brandElement = screen.getAllByText(/технонорд/i)[0];
  expect(brandElement).toBeInTheDocument();
});
