import React from 'react';
import { LayoutDashboard, UserPlus, Users, GraduationCap, LogOut, X, Briefcase, Book, BookOpen, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoConectiva from '../img/conectiva-logo.jpg'; // <--- Importando a logo

export default function Sidebar({ onLogout, user, isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: UserPlus, label: 'Matricular Aluno', path: '/alunos/novo' },
    { icon: Users, label: 'Lista de Alunos', path: '/alunos' },
    { icon: Briefcase, label: 'Professores', path: '/professores' },
    { icon: Book, label: 'Disciplinas', path: '/disciplinas' },
    { icon: GraduationCap, label: 'Turmas', path: '/turmas' },
    { label: 'Relatórios', path: '/relatorios', icon: BarChart3 }
    // { icon: BookOpen, label: 'Portal Professor', path: '/portal-professor' },
];

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
        fixed top-0 left-0 z-50 h-screen w-64 bg-conectiva-navy text-white shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 flex flex-col
      `}>
        
        {/* --- CABEÇALHO COM LOGO --- */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4 border-b border-white/10 gap-3">
  <img 
    src={logoConectiva} 
    alt="Logo" 
    className="h-12 w-12 rounded-lg shadow-lg shadow-black/20 object-cover" 
  />

  <div className="text-center">
    <span className="block text-xl font-bold tracking-tighter leading-none">
      CONECTIVA<span className="text-conectiva-lime">.</span>
    </span>
    <span className="text-[10px] text-gray-400 tracking-wide uppercase">
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
        <div className="px-6 py-8 border-b border-white/5 bg-white/5">
  <p className="text-sm text-conectiva-lime font-medium mb-1">
    Bem-vindo(a),
  </p>

  <p className="text-xl font-bold text-white truncate leading-tight">
    {user?.nome || 'Usuário'}
  </p>

  <p className="text-sm text-gray-300 capitalize mt-1 opacity-80">
    {user?.perfil || 'Visitante'}
  </p>
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
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-conectiva-lime text-conectiva-navy font-bold shadow-lg shadow-conectiva-lime/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-conectiva-navy' : 'text-gray-400 group-hover:text-white transition'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* --- LOGOUT --- */}
        <div className="p-4 border-t border-white/10 bg-conectiva-navy">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full rounded-lg transition font-medium text-sm"
          >
            <LogOut size={20} />
            Encerrar Sessão
          </button>
        </div>
      </aside>
    </>
  );
}