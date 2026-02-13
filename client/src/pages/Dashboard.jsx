import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_DATA } from '../mocks/data';
import { 
  Users, 
  School, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardMaster = () => {
  const { user } = useAuth();

  // Dados fictícios para o gráfico de adesão dos professores
  const dataGrafico = [
    { name: 'Infantil', total: 15, preenchidos: 12 },
    { name: 'Iniciais', total: 45, preenchidos: 38 },
    { name: 'Finais', total: 30, preenchidos: 20 },
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl"><School size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Escolas</p>
            <p className="text-xl font-bold text-slate-800">{MOCK_DATA.escolas.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Alunos Ativos</p>
            <p className="text-xl font-bold text-slate-800">{MOCK_DATA.alunos.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FileText size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Diários Pendentes</p>
            <p className="text-xl font-bold text-slate-800">14</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CheckCircle size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Frequência Média</p>
            <p className="text-xl font-bold text-slate-800">92%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Preenchimento de Diários (Requisito de Relatório) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 uppercase text-sm flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" /> Adesão ao Diário Digital
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="preenchidos" fill="#049605" radius={[4, 4, 0, 0]} name="Diários Preenchidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas de Coordenação (Requisito Juliana)  */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 uppercase text-sm mb-4">Ações Urgentes</h3>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={18} />
              <p className="text-[11px] text-red-700 font-medium">
                3 turmas dos Anos Finais estão há mais de 5 dias sem registro de frequência.
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <FileText className="text-blue-500 shrink-0" size={18} />
              <p className="text-[11px] text-blue-700 font-medium">
                Você possui 8 planejamentos aguardando análise técnica. 
              </p>
            </div>
          </div>
          <button className="w-full mt-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition uppercase">
            Ver Todos os Relatórios 
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardMaster;