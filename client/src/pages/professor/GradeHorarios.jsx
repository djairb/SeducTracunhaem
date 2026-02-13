import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, ArrowLeft, Download, CalendarDays } from 'lucide-react';

const GradeHorarios = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { turmas } = useAuth();
  
  const turmaAtual = turmas.find(t => t.id === Number(turmaId));

  // Simulação de dados da grade (No real, isso viria do banco)
  const tempos = ["07:30", "08:20", "09:10", "10:20", "11:10"];
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const gradeMock = {
    "07:30": { Segunda: "Matemática", Terça: "Português", Quarta: "Ciências", Quinta: "História", Sexta: "Geografia" },
    "08:20": { Segunda: "Matemática", Terça: "Artes", Quarta: "Ciências", Quinta: "Inglês", Sexta: "Ed. Física" },
    "09:10": { Segunda: "Português", Terça: "Matemática", Quarta: "História", Quinta: "Português", Sexta: "Matemática" },
    "10:20": { Segunda: "História", Terça: "Geografia", Quarta: "Matemática", Quinta: "Artes", Sexta: "Português" },
    "11:10": { Segunda: "Geografia", Terça: "Ciências", Quarta: "Português", Quinta: "Matemática", Sexta: "Projetos" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Grade de Horários</h1>
            <p className="text-[10px] font-black text-primary uppercase">{turmaAtual?.nome} — 2026</p>
          </div>
        </div>
        <button className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200">
          <Download size={16} /> Baixar PDF da Grade
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="flex items-center gap-2"><Clock size={14}/> Horário</div>
                </th>
                {dias.map(dia => (
                  <th key={dia} className="p-6 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest border-b border-slate-100">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tempos.map(horario => (
                <tr key={horario} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <span className="text-xs font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">{horario}</span>
                  </td>
                  {dias.map(dia => (
                    <td key={dia} className="p-4 text-center">
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm group-hover:border-primary/20 transition-all">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                          {gradeMock[horario][dia]}
                        </p>
                        <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Sala 04</p>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><CalendarDays size={20}/></div>
        <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">
          Atenção: Mudanças na grade de horários devem ser solicitadas diretamente à Secretaria Municipal.
        </p>
      </div>
    </div>
  );
};

export default GradeHorarios;