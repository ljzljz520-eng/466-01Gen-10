import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Management from '@/pages/Management';
import Reservation from '@/pages/Reservation';
import Monitor from '@/pages/Monitor';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/management" element={<Management />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/monitor" element={<Monitor />} />
        </Route>
      </Routes>
    </Router>
  );
}
