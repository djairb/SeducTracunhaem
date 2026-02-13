import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_DATA } from '../../mocks/data';
import { Save, Calendar, BookOpen, ClipboardList } from 'lucide-react';

const DiarioClasse = () => {
  const { user } = useAuth();
  const nivel = user?.nivel_ensino; // 'Infantil', 'Iniciais' ou 'Finais'

  // Estado unificado com todos os campos possíveis do SQL e do PDF
  const [formData, setFormData] = useState({
    data_aula: new Date().toISOString().split('T')[0],
    disciplina_id: '',
    conteudo: '',
    metodologia: '',
    materiais_utilizados: '',
    // Campos específicos do Infantil [cite: 11]
    remanejar_ampliar: '',
    registro_vivencia: '',
    proposta_desenvolvimento: '',
    organizacao_tempo_espaco: '',
    objetivos_aprendizagem: '',
    // Campos específicos do Fundamental [cite: 21, 25]
    unidade_tematica: '',
    competencias_bncc: '',
    atividades_casa: '',
    avaliacao_metodo: ''
  });

  // Filtra disciplinas do mock baseadas no nível
  const disciplinas = MOCK_DATA.disciplinasPadrao.filter(d => d.nivel === nivel);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase">Diário de Classe</h1>
          <p className="text-primary font-bold text-xs uppercase tracking-widest">{nivel}</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/20">
          <Save size={18} /> Salvar Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={12}/> Data da Aula
          </label>
          <input 
            type="date" 
            className="w-full border-slate-200 rounded-lg focus:ring-primary focus:border-primary uppercase text-sm"
            value={formData.data_aula}
            onChange={(e) => setFormData({...formData, data_aula: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <BookOpen size={12}/> Disciplina / Campo de Experiência
          </label>
          <select 
            className="w-full border-slate-200 rounded-lg focus:ring-primary focus:border-primary uppercase text-sm"
            onChange={(e) => setFormData({...formData, disciplina_id: e.target.value})}
          >
            <option value="">Selecione...</option>
            {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL BASEADA NO NÍVEL PEDAGÓGICO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        
        {/* CAMPOS COMUNS (Todos os níveis) [cite: 16, 21, 25] */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Conteúdo / Objeto de Conhecimento</label>
            <textarea className="w-full border-slate-200 rounded-xl p-3 text-sm min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-wrap">Materiais Utilizados </label>
            <input className="w-full border-slate-200 rounded-lg text-sm" placeholder="Ex: Livro didático, cartolina, projetor..." />
          </div>
        </div>

        {/* --- EXCLUSIVO EDUCAÇÃO INFANTIL --- [cite: 11] */}
        {nivel === 'Infantil' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-orange-600 uppercase">Registro de Vivência</label>
              <textarea className="w-full border-orange-100 bg-orange-50/30 rounded-xl p-3 text-sm min-h-[100px]" placeholder="Como as crianças interagiram?" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-orange-600 uppercase">Proposta de Desenvolvimento</label>
              <textarea className="w-full border-orange-100 bg-orange-50/30 rounded-xl p-3 text-sm min-h-[100px]" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-orange-600 uppercase">Objetivos de Aprendizagem (BNCC)</label>
              <input className="w-full border-orange-100 bg-orange-50/30 rounded-lg text-sm" placeholder="Ex: EI03EO01, EI03EO02..." />
            </div>
          </div>
        )}

        {/* --- EXCLUSIVO ANOS INICIAIS E FINAIS --- [cite: 16, 21, 25] */}
        {nivel !== 'Infantil' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
             <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-600 uppercase">Metodologia / Encaminhamento</label>
              <textarea className="w-full border-emerald-100 bg-emerald-50/30 rounded-xl p-3 text-sm min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-600 uppercase">Atividades para Casa</label>
              <textarea className="w-full border-emerald-100 bg-emerald-50/30 rounded-xl p-3 text-sm min-h-[100px]" />
            </div>
            {/* Campo específico apenas para os Anos Finais [cite: 25] */}
            {nivel === 'Finais' && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-purple-600 uppercase">Competências e Unidades Temáticas</label>
                <input className="w-full border-purple-100 bg-purple-50/30 rounded-lg text-sm" placeholder="Mapeamento BNCC para Anos Finais..." />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-100 p-4 rounded-xl flex items-center gap-3 text-slate-500">
        <ClipboardList size={20} />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Atenção: Este registro ficará disponível para análise da coordenação após o salvamento. [cite: 8]
        </p>
      </div>
    </div>
  );
};

export default DiarioClasse;