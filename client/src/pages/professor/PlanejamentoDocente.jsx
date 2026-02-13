import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Send, ArrowLeft, BookOpen, ClipboardList } from 'lucide-react';

const PlanejamentoDocente = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { turmas, salvarPlanejamento } = useAuth();
  
  const turmaAtual = turmas.find(t => t.id === Number(turmaId));
  
  const [mes, setMes] = useState('Março');
  const [objetivos, setObjetivos] = useState('');
  const [conteudo, setConteudo] = useState('');

  const handleEnviar = (e) => {
    e.preventDefault();
    salvarPlanejamento({
      turmaId,
      mes,
      objetivos,
      conteudo,
    });
    alert("Planejamento enviado para análise da Coordenação!");
    navigate('/portal-professor');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Planejamento Pedagógico</h1>
          <p className="text-[10px] font-black text-primary uppercase">{turmaAtual?.nome}</p>
        </div>
      </div>

      <form onSubmit={handleEnviar} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Plano */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-700 uppercase text-xs mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-primary"/> Detalhes do Período
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mês de Referência</label>
                <select 
                  value={mes} 
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full border-slate-200 rounded-2xl p-3 text-sm font-bold uppercase"
                >
                  <option>Fevereiro</option>
                  <option>Março</option>
                  <option>Abril</option>
                  <option>Maio</option>
                </select>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl">
                <p className="text-[9px] font-bold text-primary uppercase leading-tight">
                  Este plano será revisado pela Coordenação antes de ser liberado para o diário.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do Plano */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Objetivos de Aprendizagem (BNCC)
              </label>
              <textarea 
                rows="4"
                className="w-full border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-medium focus:ring-primary transition-all"
                placeholder="Descreva as habilidades e competências..."
                value={objetivos}
                onChange={(e) => setObjetivos(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList size={14} /> Conteúdos e Metodologia
              </label>
              <textarea 
                rows="6"
                className="w-full border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-medium focus:ring-primary transition-all"
                placeholder="Quais atividades e conteúdos serão aplicados?"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black text-xs uppercase hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
            >
              <Send size={18} /> Enviar para Coordenação
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanejamentoDocente;