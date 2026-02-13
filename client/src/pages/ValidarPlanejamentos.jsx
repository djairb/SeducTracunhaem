import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react';

const ValidarPlanejamentos = () => {
  // Adicionamos um valor padrão [] para evitar o erro de undefined
  const { planejamentos = [], turmas = [], atualizarStatusPlanejamento } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState('Enviado');

  // O uso do optional chaining ?. garante que o filter não quebre
  const planosFiltrados = planejamentos?.filter(p => p.status === filtroStatus) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Validação Pedagógica</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Análise de Planejamentos Mensais</p>
        </div>
        
        {/* Filtros de Status */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          {['Enviado', 'Aprovado', 'Ajuste'].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                filtroStatus === s ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {planosFiltrados.length > 0 ? (
          planosFiltrados.map(plano => {
            const turma = turmas.find(t => t.id === Number(plano.turmaId));
            return (
              <div key={plano.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:border-primary/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">
                          Plano de {plano.mes} — {turma?.nome}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Enviado em: {new Date(plano.dataEnvio).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div>
                        <p className="text-[9px] font-black text-primary uppercase mb-1">Objetivos</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{plano.objetivos}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-primary uppercase mb-1">Metodologia</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{plano.conteudo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                    <button 
                      onClick={() => atualizarStatusPlanejamento(plano.id, 'Aprovado')}
                      className="flex-1 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Aprovar
                    </button>
                    <button 
                      onClick={() => atualizarStatusPlanejamento(plano.id, 'Ajuste')}
                      className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} /> Pedir Ajuste
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
            <Clock size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-black text-slate-300 uppercase text-xs">Nenhum planejamento aguardando nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidarPlanejamentos;