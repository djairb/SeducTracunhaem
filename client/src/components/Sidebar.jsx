import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileBarChart, 
  LogOut,
  X,
  School,
  Calendar,
  CheckCircle,
  ClipboardCheck, // Importando o ícone de escola
  FileSpreadsheet,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ user, onLogout, isOpen, onClose }) => {
  
  // 1. DEFINIÇÃO DINÂMICA DOS MENUS
  const adminMenuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/escolas', label: 'Gestão de Escolas', icon: <School size={20} /> }, // ADICIONADO AQUI
    { path: '/alunos', label: 'Lista de Alunos', icon: <Users size={20} /> },
    { path: '/calendario', label: 'Calendário Escolar', icon: <Calendar size={20} /> },
    { path: '/professores', label: 'Professores', icon: <GraduationCap size={20} /> },
    { path: '/turmas', label: 'Turmas & Gestão', icon: <BookOpen size={20} /> },
    { path: '/relatorios', label: 'Relatórios', icon: <FileBarChart size={20} /> },
    { path: '/validar-planejamentos', label: 'Validar Planos', icon: <ClipboardCheck size={20} /> },
    { path: '/relatorios/ata-resultados', label: 'Ata de Resultados', icon: <FileSpreadsheet size={20} /> },
    { path: '/gestao-horarios', label: 'Matriz & Horários', icon: <CalendarDays size={20} /> }, // NOVO ITEM
  ];

 const { getTurmasVinculadas } = useAuth();
const turmasDocente = getTurmasVinculadas();
const primeiraTurmaId = turmasDocente[0]?.id || '';

const professorMenuItems = [
  { path: '/portal-professor', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  // Agora passamos o ID da primeira turma para evitar o erro de rota
  { 
    path: `/professor/frequencia/${primeiraTurmaId}`, 
    label: 'Frequência (Chamada)', 
    icon: <CheckCircle size={20} /> 
  },
  { 
    path: `/professor/diario/${primeiraTurmaId}`, 
    label: 'Diário de Classe', 
    icon: <BookOpen size={20} /> 
  },
  { path: '/professor/avaliacao', label: 'Avaliações', icon: <FileBarChart size={20} /> },
];

  // Escolhe qual menu mostrar baseado no perfil do usuário
  const menuItems = user?.perfil === 'Professor' ? professorMenuItems : adminMenuItems;

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
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold shadow-sm shadow-primary/40">T</div>
              <span className="font-bold text-slate-800 uppercase tracking-tight">Seduc <span className="text-primary">Admin</span></span>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-400 p-1">
              <X size={24} />
            </button>
          </div>

          {/* Navegação Dinâmica */}
<nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
  {menuItems.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onClose}
      // ADICIONE A PROPRIEDADE END AQUI
      end={item.path === '/relatorios' || item.path === '/'} 
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase transition-all tracking-tight
        ${isActive 
          ? 'bg-primary/10 text-primary border-r-4 border-primary shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
      `}
    >
      {item.icon}
      {item.label}
    </NavLink>
  ))}
</nav>

          {/* Info Usuário e Logout */}
          <div className="pt-6 border-t border-slate-100 mt-auto">
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Acesso Atual</p>
              <p className="text-xs font-bold text-slate-700 truncate">{user?.nome}</p>
              <p className="text-[9px] font-bold text-primary uppercase">{user?.perfil_descricao || user?.perfil}</p>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-black text-[11px] uppercase hover:bg-red-50 rounded-xl transition-all active:scale-95"
            >
              <LogOut size={18} />
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;