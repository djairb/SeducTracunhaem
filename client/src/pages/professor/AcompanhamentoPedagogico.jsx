import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Award, 
  FileText, 
  UserCircle,
  Calendar,
  CheckCircle
} from 'lucide-react';

const AcompanhamentoPedagogico = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { user, turmas, alunos, salvarRegistroPedagogico, getRegistrosAluno } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState('conquista'); // 'conquista' ou 'parecer'
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState('Março');
  const [tipoParecer, setTipoParecer] = useState('Inicial');
  const [textoRegistro, setTextoRegistro] = useState('');
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const turma = turmas.find(t => t.id === Number(turmaId));
  const alunosDaTurma = alunos.filter(a => Number(a.turma_id) === Number(turmaId));

  const handleSalvar = () => {
    if (!alunoSelecionado || !textoRegistro) {
      alert("Selecione um aluno e escreva o registro.");
      return;
    }

    const dados = {
      alunoId: alunoSelecionado.id,
      tipo: abaAtiva === 'conquista' ? 'Conquista' : 'Parecer',
      periodo: abaAtiva === 'conquista' ? mesSelecionado : tipoParecer,
      texto: textoRegistro,
      professorId: user.id
    };

    salvarRegistroPedagogico(dados);
    setSalvoFeedback(true);
    setTextoRegistro('');
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Acompanhamento</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
              {turma?.nome} — {user.nivel_ensino === 'Infantil' ? 'Educação Infantil' : 'Anos Iniciais'}
            </p>
          </div>
        </div>

        {/* ABAS SEPARADAS (Desejo do Júnior) */}
        <div className="bg-slate-100 p-1 rounded-2xl flex">
          <button 
            onClick={() => { setAbaAtiva('conquista'); setAlunoSelecionado(null); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${abaAtiva === 'conquista' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <Award size={14}/> Registro de Conquista
          </button>
          <button 
            onClick={() => { setAbaAtiva('parecer'); setAlunoSelecionado(null); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${abaAtiva === 'parecer' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <FileText size={14}/> Parecer Descritivo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LISTA DE ALUNOS */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm h-fit">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Selecione o Aluno</h3>
          <div className="space-y-2">
            {alunosDaTurma.map(aluno => (
              <button
                key={aluno.id}
                onClick={() => setAlunoSelecionado(aluno)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${alunoSelecionado?.id === aluno.id ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <UserCircle size={20} />
                <span className="text-[11px] font-bold uppercase truncate">{aluno.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ÁREA DE DIGITAÇÃO LIVRE */}
        <div className="lg:col-span-2 space-y-6">
          {alunoSelecionado ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">{alunoSelecionado.nome}</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Lançamento de {abaAtiva === 'conquista' ? 'Conquista Mensal' : 'Parecer Descritivo'}
                  </p>
                </div>

                {abaAtiva === 'conquista' ? (
                  <select 
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="bg-white border-none rounded-xl text-[10px] font-black uppercase p-2 px-4 shadow-sm focus:ring-2 focus:ring-primary"
                  >
                    {['Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    {(user.nivel_ensino === 'Infantil' ? ['Inicial', '2º Semestre', 'Final'] : ['Inicial', 'Final']).map(t => (
                      <button 
                        key={t}
                        onClick={() => setTipoParecer(t)}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${tipoParecer === t ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Observações Pedagógicas (Espaço para digitação livre)</label>
                <textarea 
                  value={textoRegistro}
                  onChange={(e) => setTextoRegistro(e.target.value)}
                  placeholder={abaAtiva === 'conquista' ? "Descreva aqui as conquistas e vivências deste mês..." : "Descreva aqui o parecer descritivo do período..."}
                  className="w-full h-64 bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                {salvoFeedback ? (
                  <span className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase animate-pulse">
                    <CheckCircle size={16} /> Registro Salvo no Prontuário!
                  </span>
                ) : <div />}
                <button 
                  onClick={handleSalvar}
                  className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-200"
                >
                  <Save size={18} /> Salvar no Sistema
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-64 flex flex-col items-center justify-center text-slate-300">
              <UserCircle size={48} className="mb-2" />
              <p className="font-black text-[10px] uppercase">Selecione um aluno na lista ao lado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcompanhamentoPedagogico;