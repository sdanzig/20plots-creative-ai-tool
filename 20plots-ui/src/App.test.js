import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

test('renders welcome tooltip', () => {
  // Set the mock response here
  axios.get.mockResolvedValue({ data: false, status: 200, statusText: 'OK', headers: {}, config: {} });
  
  render(<App />);
  const linkElement = screen.getByText(/Welcome to a unique brainstorming tool/i);
  expect(linkElement).toBeInTheDocument();
});
