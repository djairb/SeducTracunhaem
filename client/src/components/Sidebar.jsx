import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, GraduationCap, LogOut, X, Briefcase, Book, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import logoSeduc from '../img/seduc-logo2.jpg';

export default function Sidebar({ onLogout, user, isOpen, onClose }) {
  const { alternarPerfil, globalSchoolId, setGlobalSchoolId } = useAuth();
  const location = useLocation();
  const [escolas, setEscolas] = React.useState([]);

  React.useEffect(() => {
    // Carrega escolas para o seletor (Apenas se for Master/Secretaria)
    if (user?.perfil === 'Master' || !user?.professorId) {
      apiService.getEscolas().then(setEscolas);
    }
  }, [user]);

  // --- MENU ITEMS DINÂMICOS PELO PERFIL ---
  let menuItems = [];

  const perfil = user?.perfil || 'Visitante';

  if (perfil === 'Professor') {
    menuItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/professor/dashboard' }, // Dashboard Professor
      { icon: BookOpen, label: 'Diário de Classe', path: '/professor/diario' },
      { icon: GraduationCap, label: 'Avaliação', path: '/professor/avaliacao' }
    ];
  } else {
    // Perfil Secretaria / Master
    menuItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: UserPlus, label: 'Matricular Aluno', path: '/alunos/novo' },
      { icon: Users, label: 'Lista de Alunos', path: '/alunos' },
      { icon: Briefcase, label: 'Professores', path: '/professores' },
      { icon: Book, label: 'Disciplinas', path: '/disciplinas' },
      { icon: GraduationCap, label: 'Turmas', path: '/turmas' },
      { label: 'Relatórios', path: '/relatorios', icon: BarChart3 }
    ];
  }

  return (
    <>
      {/* Overlay Escuro (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-seduc-primary text-white shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 flex flex-col
      `}>

        {/* --- CABEÇALHO COM LOGO --- */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4 border-b border-white/10 gap-3">
          <img
            src={logoSeduc}
            alt="Logo"
            className="h-12 w-12 rounded-lg shadow-lg shadow-black/20 object-cover"
          />

          <div className="text-center">
            <span className="block text-xl font-bold tracking-tighter leading-none">
              SEDUC<span className="text-seduc-secondary">.</span>
            </span>
            <span className="text-[10px] text-gray-200 tracking-wide uppercase">
              Gestão Acadêmica
            </span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>


        {/* --- INFO DO USUÁRIO (SAUDAÇÃO) --- */}
        <div className="px-6 py-6 border-b border-white/5 bg-white/5">
          <p className="text-sm text-seduc-secondary font-medium mb-1">
            Bem-vindo(a),
          </p>

          <p className="text-xl font-bold text-white truncate leading-tight">
            {user?.nome || 'Usuário'}
          </p>

          <p className="text-sm text-gray-200 capitalize mt-1 opacity-80 mb-4">
            {user?.perfil || 'Visitante'}
          </p>

          {/* SELETOR DE ESCOLA (GLOBAL) */}
          {(user?.perfil === 'Master' || !user?.professorId) && (
            <div className="mt-2">
              <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1 block">Contexto da Rede:</label>
              <select
                value={globalSchoolId}
                onChange={(e) => setGlobalSchoolId(e.target.value)}
                className="w-full bg-white/10 text-white text-sm border border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-seduc-secondary outline-none child:text-gray-900"
              >
                <option value="">Todas as Escolas</option>
                {escolas.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>
          )}
        </div>


        {/* --- SIMULADOR DE PERFIL (DEMO) --- */}
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
          <p className="text-[10px] font-bold text-yellow-800 uppercase mb-2 tracking-wider">Simulador de Perfil</p>

          <button
            onClick={() => user.perfil !== 'Master' && alternarPerfil('Master')}
            className={`w-full text-xs font-bold py-1.5 rounded-md transition mb-2 ${user?.perfil === 'Master' ? 'bg-white text-yellow-900 shadow-sm' : 'text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
          >
            Secretaria (Visão Geral)
          </button>

          <div className="flex gap-1">
            <button
              onClick={() => alternarPerfil('ProfessorInfantil')}
              title="Ed. Infantil (Joaquim Canuto)"
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition ${user?.nome?.includes('Infantil') ? 'bg-white text-yellow-900 shadow-sm' : 'text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
            >
              Infantil
            </button>
            <button
              onClick={() => alternarPerfil('ProfessorIniciais')}
              title="Anos Iniciais (Tancredo Neves)"
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition ${user?.nome?.includes('Iniciais') ? 'bg-white text-yellow-900 shadow-sm' : 'text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
            >
              Iniciais
            </button>
            <button
              onClick={() => alternarPerfil('ProfessorFinais')}
              title="Anos Finais (Maria Clemilda)"
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition ${user?.nome?.includes('Finais') ? 'bg-white text-yellow-900 shadow-sm' : 'text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
            >
              Finais
            </button>
          </div>
        </div>

        {/* --- NAVEGAÇÃO --- */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-seduc-secondary text-seduc-primary font-bold'
                  : 'text-gray-200 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'text-seduc-primary' : 'text-gray-200 group-hover:text-white transition'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* --- LOGOUT --- */}
        <div className="p-4 border-t border-white/10 bg-seduc-primary">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white hover:text-seduc-primary w-full rounded-lg transition font-medium text-sm shadow-sm"
          >
            <LogOut size={20} />
            Encerrar Sessão
          </button>
        </div>
      </aside>
    </>
  );
}