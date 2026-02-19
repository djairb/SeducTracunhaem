import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Trophy, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

const LancamentoConceitos = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { user, turmas, alunos } = useAuth();

  const turma = turmas.find(t => t.id === Number(turmaId));
  const alunosDaTurma = alunos.filter(a => Number(a.turma_id) === Number(turmaId));

  // Define os períodos com base no nível (Requisito do Júnior)
  const periodos = user?.nivel_ensino === 'Infantil' 
    ? ['1º Semestre', '2º Semestre'] 
    : ['1º Trimestre', '2º Trimestre', '3º Trimestre'];

  const [conceitos, setConceitos] = useState({});
  const [feedback, setFeedback] = useState(false);

  const handleSelectChange = (alunoId, periodo, valor) => {
    setConceitos(prev => ({
      ...prev,
      [`${alunoId}-${periodo}`]: valor
    }));
  };

  const handleSalvar = () => {
    console.log("Salvando Conceitos:", conceitos);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Lançamento de Conceitos</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">
              {turma?.nome} — {user?.nivel_ensino === 'Infantil' ? 'Avaliação Semestral' : 'Avaliação Trimestral'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSalvar}
          className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-primary transition-all shadow-lg"
        >
          <Save size={16} /> Salvar Conceitos
        </button>
      </div>

      {/* LEGENDA RÁPIDA */}
      <div className="flex gap-4 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-700">
          <div className="w-4 h-4 bg-emerald-500 rounded text-white flex items-center justify-center">C</div> Construído
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-700">
          <div className="w-4 h-4 bg-amber-500 rounded text-white flex items-center justify-center">EC</div> Em Construção
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-700">
          <div className="w-4 h-4 bg-red-500 rounded text-white flex items-center justify-center">NC</div> Não Construído
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Estudante</th>
              {periodos.map(p => (
                <th key={p} className="p-6 text-[10px] font-black text-slate-400 uppercase text-center border-l border-slate-100">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alunosDaTurma.map(aluno => (
              <tr key={aluno.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="text-xs font-black text-slate-700 uppercase">{aluno.nome}</p>
                </td>
                {periodos.map(p => (
                  <td key={p} className="p-4 border-l border-slate-100">
                    <select 
                      value={conceitos[`${aluno.id}-${p}`] || ''}
                      onChange={(e) => handleSelectChange(aluno.id, p, e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase p-2 focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Lançar...</option>
                      <option value="C">Construído (C)</option>
                      <option value="EC">Em Construção (EC)</option>
                      <option value="NC">Não Construído (NC)</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {feedback && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={20}/>
          <span className="text-[10px] font-black uppercase">Conceitos salvos com sucesso!</span>
        </div>
      )}
    </div>
  );
};

export default LancamentoConceitos;