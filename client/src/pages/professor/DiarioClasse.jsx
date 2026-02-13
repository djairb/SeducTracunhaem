import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Save, ArrowLeft, BookOpen, PenTool, Sparkles, FileText } from 'lucide-react';

const DiarioClasse = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { turmas, isDiaBloqueado } = useAuth();

  const [dataRegistro, setDataRegistro] = useState(new Date().toISOString().split('T')[0]);
  const [textoRegistro, setTextoRegistro] = useState('');

  const turmaAtual = turmas.find(t => t.id === Number(turmaId));
  const isInfantil = turmaAtual?.nivel_ensino === 'Infantil';
  const diaBloqueado = isDiaBloqueado(dataRegistro);

  const handleSalvar = (e) => {
    e.preventDefault();
    if (diaBloqueado) return alert("Não é possível registrar em dias não letivos!");
    
    console.log("Salvando Diário:", {
      turma: turmaAtual.nome,
      data: dataRegistro,
      registro: textoRegistro
    });
    
    alert("Diário de Aula registrado com sucesso!");
    navigate('/portal-professor');
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-primary transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
              Registro de Aula
            </h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
              {turmaAtual?.nome} — {isInfantil ? 'Educação Infantil' : 'Ensino Fundamental'}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${diaBloqueado ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 shadow-sm'}`}>
          <BookOpen size={16} className={diaBloqueado ? 'text-red-500' : 'text-primary'} />
          <input 
            type="date" 
            value={dataRegistro} 
            onChange={(e) => setDataRegistro(e.target.value)}
            className="font-black uppercase text-[10px] border-none bg-transparent focus:ring-0"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <form onSubmit={handleSalvar} className="space-y-6">
          
          {/* ICONE E TITULO DINÂMICO */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-3xl ${isInfantil ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
              {isInfantil ? <Sparkles size={32} /> : <PenTool size={32} />}
            </div>
            <div>
              <h2 className="font-black text-slate-800 uppercase text-lg tracking-tight">
                {isInfantil ? 'Relato de Vivências e Interações' : 'Registro de Conteúdo Ministrado'}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {isInfantil ? 'Descreva as experiências pedagógicas do dia' : 'Registre o tópico da aula e atividades'}
              </p>
            </div>
          </div>

          {/* CAMPO DE TEXTO ADAPTADO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              {isInfantil ? 'O que as crianças vivenciaram hoje?' : 'Conteúdo / Atividade Realizada'}
            </label>
            <textarea 
              required
              rows="8"
              value={textoRegistro}
              onChange={(e) => setTextoRegistro(e.target.value)}
              placeholder={isInfantil ? "Ex: Hoje exploramos o jardim, observamos as cores das flores e trabalhamos a percepção sensorial..." : "Ex: Equações de 1º grau - Explicação teórica e resolução de exercícios do livro pág 45..."}
              className="w-full border-slate-100 bg-slate-50 rounded-[2rem] p-6 text-sm font-medium focus:ring-primary focus:border-primary transition-all placeholder:text-slate-300"
            />
          </div>

          {/* TRAVA VISUAL DE CALENDÁRIO (REUSANDO A LOGICA DO PILAR 2) */}
          {diaBloqueado && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
              <FileText size={18} />
              <p className="text-[10px] font-black uppercase">Data Bloqueada: {diaBloqueado.motivo}</p>
            </div>
          )}

          <button 
            disabled={diaBloqueado}
            type="submit"
            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 transition-all ${
              diaBloqueado 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-800 text-white hover:bg-black shadow-xl shadow-slate-200 active:scale-95'
            }`}
          >
            <Save size={18} /> Finalizar Registro Diário
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiarioClasse;