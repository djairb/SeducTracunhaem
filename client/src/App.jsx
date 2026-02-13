import React, { useState } from 'react'; // Adicionei o useState para controlar a sidebar no mobile
import { Routes, Route, Navigate } from 'react-router-dom';

// --- CONTEXTO E MOCK ---
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- COMPONENTES ---
import Sidebar from './components/Sidebar'; // Importando a Sidebar que criamos

// --- PÁGINAS ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import DashboardProfessor from './pages/professor/DashboardProfessor';
import DiarioClasse from './pages/professor/DiarioClasse';
import AvaliacaoAluno from './pages/professor/AvaliacaoAluno';

// =================================================================
// 1. GUARDIÃO DE ROTAS SIMPLIFICADO
// =================================================================
const PrivateRoute = ({ children, allowedRoles }) => {
  const { signed, user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-primary text-white">Carregando...</div>;
  if (!signed) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    return <Navigate to={user.perfil === 'Professor' ? "/portal-professor" : "/"} />;
  }

  return children;
};

// =================================================================
// 2. LAYOUT ÚNICO DE VALIDAÇÃO (COM SIDEBAR AGORA!)
// =================================================================
// No seu App.jsx, localize esta parte:
const MainLayout = ({ children }) => {
  // ADICIONE escolaIdSelecionada, escolas e selecionarEscola AQUI:
  const { signOut, user, escolaIdSelecionada, escolas, selecionarEscola } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        user={user} 
        onLogout={signOut} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            {/* DROPDOWN DE SELEÇÃO DE ESCOLA (O que o Júnior vai usar) */}
            <div className="hidden md:block">
              <select 
                value={escolaIdSelecionada || ""}
                onChange={(e) => selecionarEscola(e.target.value)}
                className="text-[10px] font-bold uppercase border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:ring-primary focus:border-primary"
              >
                <option value="">Selecione a Unidade Escolar...</option>
                {escolas?.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option> //
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">{user?.nome}</p>
              <p className="text-[10px] text-primary uppercase font-bold">{user?.perfil_descricao || user?.perfil}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {user?.nome?.substring(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// =================================================================
// 3. APLICAÇÃO PRINCIPAL (ROTAS)
// =================================================================
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rotas Administrativas */}
        <Route path="/" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <MainLayout><Dashboard /></MainLayout>
          </PrivateRoute>
        } />

        {/* Rotas do Professor */}
        <Route path="/portal-professor" element={
          <PrivateRoute allowedRoles={['Professor']}>
            <MainLayout><DashboardProfessor /></MainLayout>
          </PrivateRoute>
        } />

        <Route path="/professor/diario" element={
          <PrivateRoute allowedRoles={['Professor']}>
            <MainLayout><DiarioClasse /></MainLayout>
          </PrivateRoute>
        } />

        <Route path="/professor/avaliacao" element={
          <PrivateRoute allowedRoles={['Professor']}>
            <MainLayout><AvaliacaoAluno /></MainLayout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;