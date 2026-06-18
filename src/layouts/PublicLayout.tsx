import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow pt-16 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
