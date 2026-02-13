import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  ChevronRight, 
  ClipboardCheck, 
  FileEdit,
  GraduationCap,
  CalendarDays,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DashboardProfessor = () => {
  const { user, getTurmasVinculadas, alunos: todosAlunos } = useAuth();
  const turmas = getTurmasVinculadas();

  return (
    <div className="space-y-8">
      {/* 1. SAUDAÇÃO PERSONALIZADA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
            Olá, {user?.nome?.split(' ')[0]}!
          </h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Sparkles size={12} /> Ambiente Docente — {user?.nivel_ensino || 'Rede Municipal'}
          </p>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Hoje é</p>
            <p className="text-xs font-bold text-slate-700 uppercase">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* 2. GRID DE TURMAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <GraduationCap size={16} /> Suas Turmas Alocadas
          </h2>
          <span className="text-[10px] font-black text-slate-300 uppercase italic">Ano Letivo 2026</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => {
            // Contagem real de alunos baseada no mock
            const totalAlunos = todosAlunos.filter(a => Number(a.turma_id) === Number(turma.id)).length;

            return (
              <div key={turma.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden relative">
                
                {/* BOTÃO FLUTUANTE DE GRADE (PILAR 5) */}
                <Link 
                  to={`/professor/grade/${turma.id}`}
                  className="absolute top-6 right-6 p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-primary hover:text-white transition-all z-10 shadow-sm"
                  title="Ver Grade de Horários"
                >
                  <CalendarDays size={18} />
                </Link>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-md">
                        {turma.turno}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-1 truncate pr-10">
                    {turma.nome}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                    {turma.escola_nome || 'Unidade Escolar'}
                  </p>

                  {/* 3 COLUNAS DE AÇÃO (PILAR 1, 3 e DIÁRIO) */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link 
                      to={`/professor/frequencia/${turma.id}`} 
                      className="flex flex-col items-center justify-center py-4 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm group/btn"
                    >
                      <ClipboardCheck size={20} className="mb-1" />
                      <span className="text-[8px] font-black uppercase">Chamada</span>
                    </Link>
                    
                    <Link 
                      to={`/professor/diario/${turma.id}`} 
                      className="flex flex-col items-center justify-center py-4 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm group/btn"
                    >
                      <FileEdit size={20} className="mb-1" />
                      <span className="text-[8px] font-black uppercase">Diário</span>
                    </Link>

                    <Link 
                      to={`/professor/planejamento/${turma.id}`} 
                      className="flex flex-col items-center justify-center py-4 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm group/btn"
                    >
                      <BookOpen size={20} className="mb-1" />
                      <span className="text-[8px] font-black uppercase">Planos</span>
                    </Link>
                  </div>
                </div>
                
                {/* FOOTER DO CARD COM CONTAGEM REAL */}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center group-hover:bg-slate-100 transition-colors border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">
                      {totalAlunos} Alunos Vinculados
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WIDGET DE STATUS (EXTRA PARA O PENTE FINO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-800 leading-none">98%</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Frequência Lançada</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2.5rem] flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center shadow-inner">
            <BookOpen size={28} />
          </div>
          <div>
            <h4 className="text-lg font-black text-amber-800 leading-none">Aguardando</h4>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Validação de Planejamento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfessor;