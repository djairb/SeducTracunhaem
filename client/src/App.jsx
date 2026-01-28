import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';

// --- CONTEXTO DE AUTENTICAÇÃO ---
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- COMPONENTES ---
import Sidebar from './components/Sidebar';

// --- PÁGINAS ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CadastroAluno from './pages/CadastroAluno';
import ListaAlunos from './pages/ListaAlunos';
import ListaProfessores from './pages/ListaProfessores';
import CadastroProfessor from './pages/CadastroProfessor';
import Disciplinas from './pages/Disciplinas';
import ListaTurmas from './pages/ListaTurmas';
import GerenciarTurma from './pages/GerenciarTurma';
import DashboardProfessor from './pages/professor/DashboardProfessor';
import DiarioClasse from './pages/professor/DiarioClasse';

import logoConectiva from '././img/conectiva-logo.jpg';
import RelatoriosTurma from './pages/RelatoriosTurma';

// =================================================================
// 1. COMPONENTE DE ROTA PRIVADA (O GUARDIÃO)
// =================================================================
const PrivateRoute = ({ children, allowedRoles }) => {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-conectiva-navy text-white">Carregando sistema...</div>;
  }

  // Não tá logado? Manda pro Login
  if (!signed) return <Navigate to="/login" />;

  // Se a rota exige permissão específica e o usuário não tem...
  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    // Professor tentando acessar Admin -> Vai pro Portal dele
    if (user.perfil === 'Professor') return <Navigate to="/portal-professor" />;
    // Admin tentando acessar algo proibido -> Vai pro Dashboard Admin
    return <Navigate to="/" />;
  }

  return children;
};

// =================================================================
// 2. LAYOUT ADMINISTRATIVO (COM SIDEBAR E MENU MOBILE)
// =================================================================
const LayoutAdmin = ({ children }) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Controle local do menu

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar agora recebe o signOut do Contexto */}
      <Sidebar
        user={user}
        onLogout={signOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 md:ml-64 transition-all duration-300">
        {/* Header Mobile */}
        <div className="md:hidden bg-conectiva-navy text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={28} className="text-conectiva-lime" />
            </button>
            <span className="font-bold text-lg">Connectiva.</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-conectiva-lime text-conectiva-navy flex items-center justify-center font-bold text-xs">
            {user?.nome?.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Conteúdo da Página */}
        <div className="p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// =================================================================
// 3. LAYOUT PROFESSOR (LIMPO, SEM SIDEBAR DE ADMIN)
// =================================================================
const LayoutProfessor = ({ children }) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* --- HEADER FIXO AZUL MARINHO --- */}
      <header className="bg-[#0f0155] text-white shadow-md border-b-[3px] border-[#bcfe2b] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

          {/* Logo e Marca */}
          <div className="flex items-center gap-3">
            <img
              src={logoConectiva}
              alt="Logo Conectiva"
              className="h-10 w-auto rounded-lg border-2 border-white/20 shadow-sm"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">
                Connectiva<span className="text-[#bcfe2b]">.</span>
              </h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-wider hidden md:block">
                Portal do Professor
              </p>
            </div>
          </div>

          {/* Saudação e Logout */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="font-medium text-sm">Olá, Prof. {user?.nome?.split(' ')[0]}</p>
              <p className="text-[10px] text-blue-200 uppercase">Docente</p>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-white/10"
              title="Sair do sistema"
            >
              <LogOut size={18} className="text-[#bcfe2b]" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo das Páginas (Dashboard, Diário, etc) */}
      <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
        {children}
      </div>
    </div>
  );
};

// =================================================================
// 4. APLICAÇÃO PRINCIPAL (ROTAS)
// =================================================================
function App() {
  return (
    // Envolvemos tudo no AuthProvider
    <AuthProvider>
      <Routes>

        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* --- ROTAS ADMINISTRATIVAS (Master, Coordenação) --- */}
        {/* Tudo aqui dentro ganha a Sidebar automaticamente */}
        <Route path="/" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><Dashboard /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/alunos" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><ListaAlunos /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/alunos/novo" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><CadastroAluno /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/alunos/editar/:id" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><CadastroAluno /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/professores" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><ListaProfessores /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/professores/novo" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><CadastroProfessor /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/professores/editar/:id" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><CadastroProfessor /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/disciplinas" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><Disciplinas /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/turmas" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><ListaTurmas /></LayoutAdmin>
          </PrivateRoute>
        } />

        <Route path="/turmas/:id" element={
          <PrivateRoute allowedRoles={['Master', 'Coordenacao', 'Secretaria']}>
            <LayoutAdmin><GerenciarTurma /></LayoutAdmin>
          </PrivateRoute>
        } />


        {/* --- ROTAS DO PROFESSOR --- */}
        {/* Usa o layout limpo */}
        <Route path="/portal-professor" element={
          <PrivateRoute allowedRoles={['Professor']}>
            <LayoutProfessor><DashboardProfessor /></LayoutProfessor>
          </PrivateRoute>
        } />

        <Route path="/professor/diario/:id" element={
          <PrivateRoute allowedRoles={['Professor']}>
            <LayoutProfessor><DiarioClasse /></LayoutProfessor>
          </PrivateRoute>
        } />

        <Route path="/relatorios" element={<PrivateRoute allowedRoles={['Master', 'Coordenacao']}><LayoutAdmin><RelatoriosTurma /></LayoutAdmin></PrivateRoute>} />

        {/* Rota Padrão (Redireciona para login se url não existir) */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;