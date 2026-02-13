import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Search, GraduationCap, School, Filter, X } from 'lucide-react';

const ListaAlunos = () => {
  const { escolaIdSelecionada, escolas, getAlunosPorEscola, getTurmasPorEscola } = useAuth();
  
  // 1. Estados para os filtros
  const [filtroTurma, setFiltroTurma] = useState("");
  const [buscaNome, setBuscaNome] = useState("");

  const escolaAtual = escolas.find(e => e.id === escolaIdSelecionada);
  const turmasDaEscola = getTurmasPorEscola();
  const todosAlunos = getAlunosPorEscola();

  // 2. O useEffect fica AQUI (fora de qualquer outra função)
  useEffect(() => {
    setFiltroTurma(""); // Limpa o filtro de turma quando a escola mudar
    setBuscaNome("");   // Limpa a busca por nome quando a escola mudar
  }, [escolaIdSelecionada]);

  // 3. Lógica de filtragem (Apenas a lógica, sem hooks dentro)
  const alunosFiltrados = todosAlunos.filter(aluno => {
    const matchesTurma = filtroTurma ? Number(aluno.turma_id) === Number(filtroTurma) : true;
    const matchesNome = aluno.nome.toLowerCase().includes(buscaNome.toLowerCase());
    return matchesTurma && matchesNome;
  });

  if (!escolaIdSelecionada) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <School size={48} className="opacity-20 mb-4" />
        <h2 className="font-black uppercase text-slate-600 tracking-widest">Selecione uma Unidade</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Alunos Matriculados</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{escolaAtual?.nome}</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 shadow-lg shadow-primary/20">
          <UserPlus size={18} /> Novo Aluno
        </button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-full">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="BUSCAR ESTUDANTE..." 
            className="bg-transparent border-none focus:ring-0 text-[11px] font-black uppercase w-full"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
          />
          {buscaNome && <X size={14} className="cursor-pointer text-slate-400" onClick={() => setBuscaNome("")} />}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-full md:w-auto">
          <Filter size={16} className="text-primary" />
          <select 
            className="bg-transparent border-none text-[11px] font-black uppercase focus:ring-0 min-w-[180px]"
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
          >
            <option value="">Todas as Turmas</option>
            {turmasDaEscola.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudante</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turma</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {alunosFiltrados.length > 0 ? (
              alunosFiltrados.map(aluno => (
                <tr key={aluno.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-5 font-black text-slate-700 uppercase text-xs">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                        {aluno.nome.substring(0,2).toUpperCase()}
                       </div>
                       {aluno.nome}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">
                      {turmasDaEscola.find(t => t.id === Number(aluno.turma_id))?.nome || "S/ Turma"}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter transition-colors">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center text-slate-300 font-bold uppercase text-xs">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaAlunos;