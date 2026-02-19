import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  FileEdit,
  GraduationCap,
  CalendarDays,
  Sparkles,
  ArrowRight,
  FileText,
  BarChart3,
  Trophy // Ícone para os Conceitos (Pilar 4)
} from 'lucide-react';

const DashboardProfessor = () => {
  const { user, getTurmasVinculadas, alunos: todosAlunos } = useAuth();
  const turmas = getTurmasVinculadas();
  const navigate = useNavigate();

  const handleAcompanhamentoClick = (turma) => {
    // Regra: Infantil e 1º/2º anos usam Registros Pedagógicos (Acompanhamento)
    const usaAcompanhamento = 
      user?.nivel_ensino === 'Infantil' || 
      (user?.nivel_ensino === 'Iniciais' && (turma.nome.includes('1º') || turma.nome.includes('2º')));

    if (usaAcompanhamento) {
      navigate(`/portal-professor/acompanhamento/${turma.id}`);
    } else {
      navigate(`/professor/avaliacao`); // Notas tradicionais para 3º ao 9º ano
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER DE SAUDAÇÃO */}
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

      {/* LISTAGEM DE TURMAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <GraduationCap size={16} /> Suas Turmas Alocadas
          </h2>
          <span className="text-[10px] font-black text-slate-300 uppercase italic">Ano Letivo 2026</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => {
            const totalAlunos = todosAlunos.filter(a => Number(a.turma_id) === Number(turma.id)).length;
            
            // Verifica se a turma exige a aba de Conceitos (Infantil e 1º/2º anos)
            const isNivelConceito = 
              user?.nivel_ensino === 'Infantil' || 
              (user?.nivel_ensino === 'Iniciais' && (turma.nome.includes('1º') || turma.nome.includes('2º')));

            return (
              <div key={turma.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden relative">
                
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
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-6 text-primary">
                    {turma.escola_nome || 'Unidade Escolar'}
                  </p>

                  {/* GRID DE AÇÕES - 3 COLUNAS PARA COMPORTAR TUDO */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link 
                      to={`/professor/frequencia/${turma.id}`} 
                      className="flex flex-col items-center justify-center py-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                      <ClipboardCheck size={18} className="mb-1" />
                      <span className="text-[7px] font-black uppercase italic">Chamada</span>
                    </Link>
                    
                    <Link 
                      to={`/professor/diario/${turma.id}`} 
                      className="flex flex-col items-center justify-center py-3 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <FileEdit size={18} className="mb-1" />
                      <span className="text-[7px] font-black uppercase italic">Diário</span>
                    </Link>

                    <Link 
                      to={`/professor/planejamento/${turma.id}`} 
                      className="flex flex-col items-center justify-center py-3 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                    >
                      <BookOpen size={18} className="mb-1" />
                      <span className="text-[7px] font-black uppercase italic">Planos</span>
                    </Link>

                    {/* Botão de Registros (Parecer/Conquista) ou Notas */}
                    <button 
                      onClick={() => handleAcompanhamentoClick(turma)}
                      className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all shadow-sm ${
                        isNivelConceito 
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white' 
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white'
                      }`}
                    >
                      {isNivelConceito ? <FileText size={18} className="mb-1" /> : <BarChart3 size={18} className="mb-1" />}
                      <span className="text-[7px] font-black uppercase italic">
                        {isNivelConceito ? 'Registros' : 'Notas'}
                      </span>
                    </button>

                    {/* BOTÃO DE CONCEITOS (Exclusivo Infantil/1º e 2º Ano) */}
                    {isNivelConceito && (
                      <Link 
                        to={`/portal-professor/conceitos/${turma.id}`} 
                        className="flex flex-col items-center justify-center py-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trophy size={18} className="mb-1" />
                        <span className="text-[7px] font-black uppercase italic">Conceitos</span>
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">
                      {totalAlunos} Alunos
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardProfessor;