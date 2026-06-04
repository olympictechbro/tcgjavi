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
import SetDetail from './pages/SetDetail';

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
            <Route path="/set/:id"   element={<SetDetail />} />
          </Routes>

          {/* Floating + button — sits above the pill nav */}
          <button
            onClick={() => setAddOpen(true)}
            className="fixed left-1/2 -translate-x-1/2 z-40 press-scale"
            style={{
              bottom: '88px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#00cc44',
              boxShadow: '0 0 20px rgba(0,204,68,0.5), 0 4px 12px rgba(0,0,0,0.4)',
              border: '2px solid #0a0e0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={18} strokeWidth={2.5} className="text-black" />
          </button>

          <BottomNav />
          <AddCardSheet open={addOpen} onClose={() => setAddOpen(false)} />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
