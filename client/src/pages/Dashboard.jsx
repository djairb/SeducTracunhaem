import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  School, 
  FileText, 
  CheckCircle, 
  BarChart3,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { escolaIdSelecionada, escolas, alunos, turmas } = useAuth();

  // 1. FILTRAGEM DINÂMICA
  const escolaAtual = escolas.find(e => e.id === escolaIdSelecionada);
  
  // Filtra as turmas da escola selecionada
  const turmasDaEscola = escolaIdSelecionada 
    ? turmas.filter(t => t.escola_id === escolaIdSelecionada) 
    : turmas;

  // Filtra os alunos que pertencem a essas turmas
  const alunosDaEscola = escolaIdSelecionada
    ? alunos.filter(a => turmasDaEscola.some(t => t.id === a.turma_id))
    : alunos;

  // 2. DADOS PARA O GRÁFICO (Simulando progresso por nível da escola selecionada)
  const statsGrafico = [
    { name: 'Infantil', total: turmasDaEscola.filter(t => t.nivel_ensino === 'Infantil').length },
    { name: 'Iniciais', total: turmasDaEscola.filter(t => t.nivel_ensino === 'Iniciais').length },
    { name: 'Finais', total: turmasDaEscola.filter(t => t.nivel_ensino === 'Finais').length },
  ];

  return (
    <div className="space-y-6">
      {/* Título Dinâmico */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase leading-tight">
            {escolaIdSelecionada ? escolaAtual?.nome : "Visão Geral da Rede"}
          </h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {escolaIdSelecionada ? `INEP: ${escolaAtual?.inep}` : "Consolidado Municipal"}
          </p>
        </div>
      </div>

      {/* Cards Estatísticos Reativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl"><Users size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Alunos</p>
            <p className="text-xl font-bold text-slate-800">{alunosDaEscola.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><School size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Turmas</p>
            <p className="text-xl font-bold text-slate-800">{turmasDaEscola.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FileText size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Diários Hoje</p>
            <p className="text-xl font-bold text-slate-800">{Math.floor(turmasDaEscola.length * 0.7)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Freq. Média</p>
            <p className="text-xl font-bold text-slate-800">94.2%</p>
          </div>
        </div>
      </div>

      {/* Gráfico Reativo */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 uppercase text-xs mb-6 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary"/> Distribuição de Turmas por Nível
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
              <YAxis fontSize={10} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="total" fill="#049605" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;