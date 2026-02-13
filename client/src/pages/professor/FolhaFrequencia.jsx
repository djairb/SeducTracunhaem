import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Save, 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

const FolhaFrequencia = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { 
    getAlunosPorEscola, 
    salvarPresenca, 
    turmas, 
    isDiaBloqueado // Função que criamos para o Pilar 2
  } = useAuth();
  
  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0]);
  const [lista, setLista] = useState([]);

  // Busca dados da turma para o cabeçalho
  const turmaAtual = turmas.find(t => t.id === Number(turmaId));
  
  // Verifica se a data selecionada está bloqueada no calendário escolar
  const diaBloqueado = isDiaBloqueado(dataChamada);

  useEffect(() => {
    const alunos = getAlunosPorEscola().filter(a => Number(a.turma_id) === Number(turmaId));
    setLista(alunos.map(a => ({ alunoId: a.id, nome: a.nome, status: 'P' })));
  }, [turmaId, getAlunosPorEscola]);

  const toggleStatus = (id) => {
    if (diaBloqueado) return; // Impede interação se estiver bloqueado
    setLista(prev => prev.map(item => 
      item.alunoId === id ? { ...item, status: item.status === 'P' ? 'F' : 'P' } : item
    ));
  };

  const handleSalvar = () => {
    if (diaBloqueado) {
      alert("Não é possível salvar chamadas em dias não letivos.");
      return;
    }
    salvarPresenca(dataChamada, turmaId, lista);
    alert(`Frequência da turma ${turmaAtual?.nome} enviada com sucesso!`);
    navigate('/portal-professor');
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-primary transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
              Controle de Frequência
            </h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
              {turmaAtual?.nome} — {turmaAtual?.escola_nome || "Seduc Municipal"}
            </p>
          </div>
        </div>

        {/* SELETOR DE DATA COM DESTAQUE SE BLOQUEADO */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
          diaBloqueado ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <CalendarIcon size={16} className={diaBloqueado ? 'text-red-500' : 'text-primary'} />
          <input 
            type="date" 
            value={dataChamada} 
            onChange={(e) => setDataChamada(e.target.value)} 
            className={`font-black uppercase text-[10px] border-none bg-transparent focus:ring-0 p-1 ${
              diaBloqueado ? 'text-red-600' : 'text-slate-700'
            }`}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* ESTADO BLOQUEADO (PILAR 2) */}
        {diaBloqueado ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mb-4 animate-bounce">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Lançamento Suspenso</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
              Esta data foi marcada como <span className="text-red-500">"{diaBloqueado.motivo}"</span> no calendário escolar.
            </p>
            <button 
              onClick={() => navigate('/portal-professor')}
              className="mt-8 text-[10px] font-black text-primary uppercase border-b-2 border-primary pb-1"
            >
              Voltar ao Painel
            </button>
          </div>
        ) : (
          /* LISTA DE ESTUDANTES (PILAR 1) */
          <>
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Estudante</span>
              <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Presença</span>
            </div>

            <div className="divide-y divide-slate-50">
              {lista.map(aluno => (
                <div key={aluno.alunoId} className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      aluno.status === 'P' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {aluno.nome.charAt(0)}
                    </div>
                    <span className="font-black text-slate-700 uppercase text-xs tracking-tight">
                      {aluno.nome}
                    </span>
                  </div>

                  <button 
                    onClick={() => toggleStatus(aluno.alunoId)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase transition-all duration-300 ${
                      aluno.status === 'P' 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-red-500 text-white shadow-lg shadow-red-100'
                    }`}
                  >
                    {aluno.status === 'P' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {aluno.status === 'P' ? 'Presente' : 'Ausente'}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50/30 border-t border-slate-50">
              <button 
                onClick={handleSalvar} 
                className="w-full bg-slate-800 text-white py-5 rounded-[2rem] font-black text-xs uppercase hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Save size={20} /> Finalizar e Enviar Chamada
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FolhaFrequencia;