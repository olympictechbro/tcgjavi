import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { BottomNav } from './components/ui/BottomNav';
import { AddCardSheet } from './components/ui/AddCardSheet';
import Home from './pages/Home';
import Search from './pages/Search';
import Portfolio from './pages/Portfolio';
import PnL from './pages/PnL';
import Profile from './pages/Profile';
import CardDetail from './pages/CardDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="relative min-h-screen" style={{ background: '#0a0e0a' }}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/search"    element={<Search />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/pnl"       element={<PnL />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/card/:id"  element={<CardDetail />} />
          </Routes>

          {/* Floating + button */}
          <button
            onClick={() => setAddOpen(true)}
            className="fixed bottom-[52px] left-1/2 -translate-x-1/2 translate-y-1/2 z-50
              w-12 h-12 rounded-full flex items-center justify-center press-scale"
            style={{
              background: '#00cc44',
              boxShadow: '0 0 20px rgba(0,204,68,0.5), 0 4px 16px rgba(0,0,0,0.4)',
              border: '2px solid #0a0e0a',
            }}
          >
            <Plus size={22} strokeWidth={2.5} className="text-black" />
          </button>

          <BottomNav />
          <AddCardSheet open={addOpen} onClose={() => setAddOpen(false)} />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
