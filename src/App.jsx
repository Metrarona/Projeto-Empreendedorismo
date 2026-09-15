import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdemServico from './pages/OrdemServico';
import RelatorioDiario from './pages/RelatorioDiario';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ordem-servico" element={<OrdemServico />} />
        <Route path="/relatorio-diario" element={<RelatorioDiario onVoltar={() => window.history.back()} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;