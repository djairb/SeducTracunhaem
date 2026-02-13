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
  GraduationCap
} from 'lucide-react';

const DashboardProfessor = () => {
  const { user, getTurmasVinculadas } = useAuth();
  const { alunos: todosAlunos } = useAuth();
  const turmas = getTurmasVinculadas();

  return (
    <div className="space-y-8">
      {/* 1. SAUDAÇÃO PERSONALIZADA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
            Olá, {user?.nome?.split(' ')[0]}!
          </h1>
          <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
            Portal do Docente — {user?.nivel_ensino}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
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
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <GraduationCap size={16} /> Suas Turmas e Disciplinas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => (
            <div key={turma.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white rounded-2xl transition-colors duration-300">
                    <BookOpen size={24} />
                  </div>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {turma.turno}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-1">
                  {turma.nome}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  Ensino {turma.nivel_ensino}
                </p>

                {/* BOTÕES DE AÇÃO RÁPIDA (O PONTO CHAVE) */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/professor/frequencia/${turma.id}`} // Envia o ID na URL
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  >
                    <ClipboardCheck size={20} className="mb-1" />
                    <span className="text-[9px] font-black uppercase">Chamada</span>
                  </Link>

                  <Link
                    to="/professor/diario"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300 group/btn shadow-sm"
                  >
                    <FileEdit size={20} className="mb-1" />
                    <span className="text-[9px] font-black uppercase">Diário</span>
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-between items-center group-hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    {/* Aqui fazemos a contagem real baseada no mock */}
                    {todosAlunos.filter(a => Number(a.turma_id) === Number(turma.id)).length} Alunos
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AVISOS RÁPIDOS (Simulação de Regras) */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl font-bold">!</div>
        <div>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Lembrete da Coordenação</p>
          <p className="text-xs font-medium text-amber-800">
            O prazo para fechamento dos diários do 1º Bimestre encerra em 15 dias. Não deixe para a última hora!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfessor;