import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Check, 
  X, 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Save, 
  LayoutGrid, 
  CalendarDays,
  Info,
  Clock,
  AlertCircle
} from 'lucide-react';

const FolhaFrequencia = () => {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { user, turmas, alunos, salvarPresenca, salvarFrequenciaLote, isDiaBloqueado } = useAuth();

  const [modoVisao, setModoVisao] = useState('diario'); // 'diario' ou 'mensal'
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('');
  
  const turma = turmas.find(t => t.id === Number(turmaId));
  const alunosDaTurma = alunos.filter(a => Number(a.turma_id) === Number(turmaId));

  // Estado para a chamada do dia
  const [chamadaDia, setChamadaDia] = useState({});

  // Inicializa a chamada com "P" (Presente) para todos
  useEffect(() => {
    const inicial = {};
    alunosDaTurma.forEach(a => { inicial[a.id] = { status: 'P', justificativa: '' }; });
    setChamadaDia(inicial);
  }, [turmaId]);

  const toggleStatus = (alunoId) => {
    setChamadaDia(prev => {
      const atual = prev[alunoId]?.status;
      let proximo = 'P';
      if (atual === 'P') proximo = 'F';
      else if (atual === 'F') proximo = 'J'; // Justificada (Novo requisito!)
      
      return { ...prev, [alunoId]: { ...prev[alunoId], status: proximo } };
    });
  };

  const handleSalvarDiario = () => {
    if (user.nivel_ensino === 'Finais' && !disciplinaSelecionada) {
      alert("Por favor, selecione a disciplina/horário.");
      return;
    }

    const lista = Object.entries(chamadaDia).map(([alunoId, dados]) => ({
      alunoId: Number(alunoId),
      ...dados
    }));

    salvarPresenca(dataSelecionada, Number(turmaId), lista);
    alert("Frequência salva com sucesso!");
    navigate('/portal-professor');
  };

  // Renderização do seletor de Disciplina para Anos Finais
  const SeletorDisciplina = () => (
    user.nivel_ensino === 'Finais' && (
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 mb-6">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Clock size={20}/></div>
        <div className="flex-1">
          <label className="block text-[10px] font-black text-amber-700 uppercase mb-1">Disciplina / Tempo de Aula</label>
          <select 
            value={disciplinaSelecionada}
            onChange={(e) => setDisciplinaSelecionada(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0 text-amber-900"
          >
            <option value="">Selecione sua aula...</option>
            <option value="matematica">Matemática (1º Tempo)</option>
            <option value="matematica_2">Matemática (2º Tempo)</option>
          </select>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Frequência</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{turma?.nome} — {user.nivel_ensino}</p>
          </div>
        </div>

        {/* TOGGLE MODO DE VISÃO */}
        <div className="bg-slate-100 p-1 rounded-2xl flex">
          <button 
            onClick={() => setModoVisao('diario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modoVisao === 'diario' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <CalendarIcon size={14}/> Diário
          </button>
          <button 
            onClick={() => setModoVisao('mensal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modoVisao === 'mensal' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <LayoutGrid size={14}/> Mensal
          </button>
        </div>
      </div>

      <SeletorDisciplina />

      {modoVisao === 'diario' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="bg-white border-none rounded-xl text-xs font-black uppercase p-2 shadow-sm"
              />
              {isDiaBloqueado(dataSelecionada) && (
                <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg uppercase">
                  <AlertCircle size={12}/> Dia Não Letivo
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Dica: Clique no ícone para alternar P, F ou J
            </p>
          </div>

          <div className="divide-y divide-slate-50">
            {alunosDaTurma.map((aluno, idx) => (
              <div key={aluno.id} className="p-4 px-8 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
                  <p className="text-xs font-bold text-slate-700 uppercase">{aluno.nome}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(aluno.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm ${
                      chamadaDia[aluno.id]?.status === 'P' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                      chamadaDia[aluno.id]?.status === 'F' ? 'bg-red-500 text-white shadow-red-200' :
                      'bg-amber-500 text-white shadow-amber-200'
                    }`}
                  >
                    {chamadaDia[aluno.id]?.status}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-50/50 flex justify-end border-t border-slate-100">
            <button 
              onClick={handleSalvarDiario}
              className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-200"
            >
              <Save size={18} /> Salvar Frequência
            </button>
          </div>
        </div>
      ) : (
        /* VISÃO MENSAL - SIMULAÇÃO DE GRADE */
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 text-center py-20">
           <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" />
           <h3 className="text-xl font-black text-slate-800 uppercase italic">Visão Mensal em Grade</h3>
           <p className="text-xs text-slate-400 font-bold uppercase mt-2 max-w-sm mx-auto">
             Esta interface permite o lançamento de faltas justificadas (J) em lote para todo o período letivo.
           </p>
           <button className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-primary/30">
             Abrir Grade do Mês
           </button>
        </div>
      )}
    </div>
  );
};

export default FolhaFrequencia;