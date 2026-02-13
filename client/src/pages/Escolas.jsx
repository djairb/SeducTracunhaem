import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, School, Settings2, CheckCircle } from 'lucide-react';

const Escolas = () => {
  const { escolas, adicionarEscola, selecionarEscola, escolaIdSelecionada } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 uppercase">Gestão de Escolas</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2"
        >
          <Plus size={18}/> Nova Escola
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {escolas.map(escola => (
          <div 
            key={escola.id} 
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              escolaIdSelecionada === escola.id ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
            }`}
            onClick={() => selecionarEscola(escola.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${escolaIdSelecionada === escola.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                <School size={24}/>
              </div>
              {escolaIdSelecionada === escola.id && <CheckCircle size={20} className="text-primary" />}
            </div>
            <h3 className="font-bold text-slate-800 uppercase text-sm mb-1">{escola.nome}</h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">INEP: {escola.inep}</p>
            
            <button className="mt-4 text-[10px] font-bold text-primary uppercase flex items-center gap-1 hover:underline">
              <Settings2 size={12}/> Configurações da Unidade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Escolas;