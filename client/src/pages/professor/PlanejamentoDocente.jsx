import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react';

const PlanejamentoDocente = () => {
  const { user, turmas, salvarPlanejamento } = useAuth();
  const { turmaId } = useParams();
  const navigate = useNavigate();

  const turmaAtual = turmas.find(t => t.id === Number(turmaId));
  
  // Estado inicial dinâmico baseado no nível de ensino
  const [formData, setFormData] = useState({
    titulo: '',
    dataInicio: '',
    dataFim: '',
    // Campos da Ed. Infantil
    remanejarAmpliar: '',
    registroVivencia: '',
    propostaDesenvolvimento: '',
    organizacaoEspaco: '',
    // Campos dos Anos Iniciais/Finais
    conteudo: '',
    metodologia: '',
    avaliacao: '',
    atividadesCasa: '',
    materiais: '',
    objetoAprendizagem: '',
    // Campos exclusivos dos Anos Finais
    unidadeTematica: '',
    competenciasGerais: '',
    competenciasEspecificas: ''
  });

  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dadosCompletos = {
      ...formData,
      turmaId: Number(turmaId),
      professorId: user.id,
      nivelEnsino: user.nivel_ensino, // Para a coordenação saber qual template ler
    };
    
    salvarPlanejamento(dadosCompletos);
    setEnviado(true);
    setTimeout(() => navigate('/portal-professor'), 2000);
  };

  // Funções de renderização de campos específicos por nível (Conforme PDF)
  const renderCamposInfantil = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Remanejar / Ampliar</label>
        <textarea name="remanejarAmpliar" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-24" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Registro de Vivência</label>
        <textarea name="registroVivencia" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-32" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Proposta de Desenvolvimento</label>
        <textarea name="propostaDesenvolvimento" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-32" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Organização de Tempo e Espaço</label>
        <textarea name="organizacaoEspaco" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-24" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Objetivos de Aprendizagem</label>
        <textarea name="objetoAprendizagem" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-24" />
      </div>
    </div>
  );

  const renderCamposIniciaisEFinais = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {user.nivel_ensino === 'Finais' && (
        <div className="md:col-span-2 bg-primary/5 p-6 rounded-[2rem] border border-primary/10 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 text-[10px] font-black text-primary uppercase flex items-center gap-2 mb-2">
            <Info size={14}/> Exclusivo Anos Finais (BNCC)
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Unidade Temática</label>
            <input type="text" name="unidadeTematica" onChange={handleChange} className="w-full bg-white border-none rounded-xl p-3 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Objeto de Aprendizagem</label>
            <input type="text" name="objetoAprendizagem" onChange={handleChange} className="w-full bg-white border-none rounded-xl p-3 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Competências Gerais</label>
            <textarea name="competenciasGerais" onChange={handleChange} className="w-full bg-white border-none rounded-xl p-3 text-sm h-20" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Competências Específicas</label>
            <textarea name="competenciasEspecificas" onChange={handleChange} className="w-full bg-white border-none rounded-xl p-3 text-sm h-20" />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Conteúdo / Assunto</label>
        <textarea name="conteudo" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-32" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Metodologia (Procedimentos)</label>
        <textarea name="metodologia" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-32" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Avaliação</label>
        <textarea name="avaliacao" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-24" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Atividades para Casa</label>
        <textarea name="atividadesCasa" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary h-24" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Materiais Utilizados</label>
        <input type="text" name="materiais" onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary" />
      </div>
    </div>
  );

  if (enviado) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase italic">Planejamento Enviado!</h2>
        <p className="text-slate-400 text-sm font-bold uppercase mt-2">A coordenação será notificada para validação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Novo Planejamento</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{turmaAtual?.nome} — {user.nivel_ensino}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Título do Plano / Tema da Aula</label>
              <input 
                required
                type="text" 
                name="titulo"
                onChange={handleChange}
                placeholder="Ex: Operações Básicas ou Projeto Carnaval"
                className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Início</label>
                 <input required type="date" name="dataInicio" onChange={handleChange} className="w-full bg-white border-none rounded-2xl p-4 text-xs font-bold" />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fim</label>
                 <input required type="date" name="dataFim" onChange={handleChange} className="w-full bg-white border-none rounded-2xl p-4 text-xs font-bold" />
               </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {user.nivel_ensino === 'Infantil' ? renderCamposInfantil() : renderCamposIniciaisEFinais()}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-200"
          >
            <Send size={18} /> Enviar para Coordenação
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanejamentoDocente;