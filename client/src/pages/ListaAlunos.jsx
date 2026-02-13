import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Search, GraduationCap, School } from 'lucide-react';

const ListaAlunos = () => {
  const { escolaIdSelecionada, escolas, getAlunosPorEscola } = useAuth();
  
  const alunosFiltrados = getAlunosPorEscola();
  const escolaAtual = escolas.find(e => e.id === escolaIdSelecionada);

  if (!escolaIdSelecionada) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <School size={64} className="opacity-20" />
        <p className="font-bold uppercase tracking-widest text-sm">Selecione uma escola no menu superior para gerenciar os alunos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase leading-tight">
            Alunos <span className="text-primary tracking-tighter">— {escolaAtual?.nome}</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total nesta unidade: {alunosFiltrados.length} estudantes
          </p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-primary-dark transition shadow-lg shadow-primary/20">
          <UserPlus size={18} /> Matricular Novo Aluno
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="PESQUISAR POR NOME OU MATRÍCULA..." 
            className="bg-transparent border-none focus:ring-0 text-xs font-bold uppercase w-full"
          />
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">Estudante</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">Status</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {alunosFiltrados.map(aluno => (
              <tr key={aluno.id} className="hover:bg-slate-50 transition cursor-pointer">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 uppercase">{aluno.nome}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">RA: 2026{aluno.id}00</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                    aluno.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {aluno.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-[10px] font-bold text-primary hover:underline uppercase">Ver Ficha</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaAlunos;