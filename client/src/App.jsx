import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- CONTEXTO E MOCK ---
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- PÁGINAS ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Admin / Secretaria
import DashboardProfessor from './pages/professor/DashboardProfessor'; // Será genérico por enquanto

// =================================================================
// 1. GUARDIÃO DE ROTAS SIMPLIFICADO
// =================================================================
const PrivateRoute = ({ children, allowedRoles }) => {
  const { signed, user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-primary text-white">Carregando...</div>;
  if (!signed) return <Navigate to="/login" />;

  // Se for professor, mas tentar acessar rota de Admin, redireciona para o portal dele
  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    return <Navigate to={user.perfil === 'Professor' ? "/portal-professor" : "/"} />;
  }

  return children;
};

// =================================================================
// 2. LAYOUT ÚNICO DE VALIDAÇÃO (Limpo para o Secretário)
// =================================================================
const MainLayout = ({ children }) => {
  const { signOut, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">S</div>
          <h1 className="font-bold text-slate-800">Seduc <span className="text-primary">Tracunhaém</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-sm font-bold text-slate-700">{user?.nome}</p>
            <p className="text-[10px] text-primary uppercase font-bold">{user?.perfil_descricao || user?.perfil}</p>
          </div>
          <button 
            onClick={signOut}
            className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto uppercase">
        {children}
      </main>
    </div>
  );
};

// =================================================================
// 3. APLICAÇÃO PRINCIPAL
// =================================================================
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota Pública de Entrada (Com os 4 botões) */}
        <Route path="/login" element={<Login />} />

        {/* Rota Administrativa (Junior/Juliana) */}
        <Route path="/" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <MainLayout><Dashboard /></MainLayout>
          </PrivateRoute>
        } />

        {/* Rota do Professor (Infantil, Iniciais ou Finais) */}
        {/* O DashboardProfessor internamente vai ler o nível do usuário logado */}
        <Route path="/portal-professor" element={
          <PrivateRoute allowedRoles={['Professor']}>
            <MainLayout><DashboardProfessor /></MainLayout>
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;