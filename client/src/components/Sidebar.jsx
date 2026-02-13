import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileBarChart, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ user, onLogout, isOpen, onClose }) => {
  
  // Links baseados nos requisitos de acesso da secretaria [cite: 2, 6]
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/alunos', label: 'Alunos', icon: <Users size={20} /> },
    { path: '/professores', label: 'Professores', icon: <GraduationCap size={20} /> },
    { path: '/turmas', label: 'Turmas & Gestão', icon: <BookOpen size={20} /> },
    { path: '/relatorios', label: 'Relatórios', icon: <FileBarChart size={20} /> },
  ];

  return (
    <>
      {/* Overlay para Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 w-64 
        transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="p-6 flex flex-col h-full">
          {/* Logo e Botão Fechar (Mobile) */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">T</div>
              <span className="font-bold text-slate-800 uppercase tracking-tight">Seduc <span className="text-primary">Admin</span></span>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase transition-all
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Info Usuário e Logout */}
          <div className="pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Usuário Logado</p>
              <p className="text-xs font-bold text-slate-700 truncate">{user?.nome}</p>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-bold text-sm uppercase hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;