import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles.css';
import RootLayout from './ui/RootLayout';
import HomePage from './pages/HomePage';
import AirdropsPage from './pages/AirdropsPage';
import FaucetsPage from './pages/FaucetsPage';
import WaitlistsPage from './pages/WaitlistsPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'airdrops', element: <AirdropsPage /> },
      { path: 'faucets', element: <FaucetsPage /> },
      { path: 'waitlists', element: <WaitlistsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);


