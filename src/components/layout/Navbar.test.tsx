import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AuthProvider } from '../../contexts/AuthContext';
import { CartProvider } from '../../contexts/CartContext';
import { NotificationProvider } from '../../contexts/NotificationContext';

describe('Navbar Component', () => {
  it('renders the brand name', () => {
    render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/AtelierTextile/i)).toBeInTheDocument();
  });
});
