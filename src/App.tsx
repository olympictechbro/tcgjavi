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
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 1,
    },
  },
});

export default function App() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/search"    element={<Search />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/pnl"       element={<PnL />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/card/:id"  element={<CardDetail />} />
          </Routes>

          {/* Floating + button (center of bottom nav) */}
          <button
            onClick={() => setAddOpen(true)}
            className="fixed bottom-[52px] left-1/2 -translate-x-1/2 translate-y-1/2 z-50
              w-14 h-14 rounded-full bg-[#007AFF] shadow-lg shadow-[#007AFF]/40
              flex items-center justify-center press-scale
              border-4 border-white"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,122,255,0.5))' }}
          >
            <Plus size={26} strokeWidth={2.5} className="text-white" />
          </button>

          <BottomNav />
          <AddCardSheet open={addOpen} onClose={() => setAddOpen(false)} />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
