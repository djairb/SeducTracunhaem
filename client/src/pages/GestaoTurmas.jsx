import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, Plus, Search, Filter, X, UserCircle, GraduationCap } from 'lucide-react';

const GestaoTurmas = () => {
  const { turmas, escolaIdSelecionada, escolas, alunos: todosAlunos } = useAuth();
  const [busca, setBusca] = useState("");
  const [turmaParaVerAlunos, setTurmaParaVerAlunos] = useState(null);

  // Filtra turmas da escola selecionada no Header
  const turmasFiltradas = turmas.filter(t => 
    t.escola_id === Number(escolaIdSelecionada) &&
    t.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const escolaAtual = escolas.find(e => e.id === Number(escolaIdSelecionada));

  // Função para pegar alunos de uma turma específica
  const getAlunosDaTurma = (idTurma) => {
    return todosAlunos.filter(aluno => Number(aluno.turma_id) === Number(idTurma));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Gestão de Turmas</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
            {escolaAtual?.nome || "Selecione uma unidade no topo"}
          </p>
        </div>
        <button className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200">
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4">
        <div className="flex-1 bg-slate-50 rounded-2xl px-4 flex items-center gap-2 border border-slate-100 focus-within:border-primary/30 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome da turma..."
            className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold uppercase placeholder:text-slate-300"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmasFiltradas.map(turma => {
          const alunosDestaTurma = getAlunosDaTurma(turma.id);
          
          return (
            <div key={turma.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                  <BookOpen size={24} />
                </div>
                <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-lg uppercase">
                  {turma.turno}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">{turma.nome}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{turma.nivel_ensino}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <Users size={14} className="text-primary" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                  {alunosDestaTurma.length} Alunos Confirmados
                </span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase hover:bg-slate-100 transition-all">
                  Configurar
                </button>
                <button 
                  onClick={() => setTurmaParaVerAlunos(turma)}
                  className="flex-1 py-3 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                >
                  Ver Alunos
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE LISTA DE ALUNOS DA TURMA */}
      {turmaParaVerAlunos && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">{turmaParaVerAlunos.nome}</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lista Nominal de Estudantes</p>
                </div>
              </div>
              <button 
                onClick={() => setTurmaParaVerAlunos(null)}
                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {getAlunosDaTurma(turmaParaVerAlunos.id).length > 0 ? (
                getAlunosDaTurma(turmaParaVerAlunos.id).map((aluno, index) => (
                  <div key={aluno.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300 w-4">{index + 1}</span>
                      <UserCircle size={24} className="text-slate-300 group-hover:text-primary transition-colors" />
                      <span className="text-xs font-bold text-slate-700 uppercase">{aluno.nome}</span>
                    </div>
                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase">Ativo</span>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase">Nenhum aluno nesta turma.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Total de {getAlunosDaTurma(turmaParaVerAlunos.id).length} alunos vinculados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoTurmas;