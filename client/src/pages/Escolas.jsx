import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, School, MapPin, Hash, Trash2 } from 'lucide-react';

const Escolas = () => {
  const { escolas, adicionarEscola } = useAuth(); // Puxando do Contexto funcional
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaEscola, setNovaEscola] = useState({ nome: '', inep: '', endereco: '' });

  const handleSave = (e) => {
    e.preventDefault();
    adicionarEscola(novaEscola); // Salva no Mock
    setIsModalOpen(false);
    setNovaEscola({ nome: '', inep: '', endereco: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase">Unidades Escolares</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gestão da Rede Municipal</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-primary-dark transition shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Cadastrar Escola
        </button>
      </div>

      {/* Grid de Escolas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {escolas.map((escola) => (
          <div key={escola.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex justify-between items-start">
            <div className="flex gap-4">
              <div className="bg-slate-50 text-slate-400 p-4 rounded-xl">
                <School size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 uppercase text-sm leading-tight mb-1">{escola.nome}</h3>
                <div className="space-y-1">
                  <p className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase"><Hash size={12}/> INEP: {escola.inep}</p>
                  <p className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase"><MapPin size={12}/> {escola.endereco}</p>
                </div>
              </div>
            </div>
            <button className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>

      {/* MODAL SIMPLES DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 uppercase">Nova Unidade</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Escola</label>
                <input 
                  autoFocus
                  className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
                  onChange={(e) => setNovaEscola({...novaEscola, nome: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Código INEP</label>
                  <input 
                    className="w-full border-slate-200 rounded-lg p-3 text-sm"
                    onChange={(e) => setNovaEscola({...novaEscola, inep: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço</label>
                  <input 
                    className="w-full border-slate-200 rounded-lg p-3 text-sm"
                    onChange={(e) => setNovaEscola({...novaEscola, endereco: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs font-bold text-slate-400 uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20">Salvar Unidade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Escolas;