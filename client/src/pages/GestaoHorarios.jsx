import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  Save, 
  CalendarDays, 
  BookOpen, 
  User, 
  ArrowLeft,
  CheckCircle,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DATA } from '../mocks/data';

const GestaoHorarios = () => {
  const { 
    turmas, 
    professores, 
    salvarGradeHoraria, 
    gradeHorarios, 
    escolaIdSelecionada 
  } = useAuth();
  const navigate = useNavigate();
  
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState('');
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [gradeLocal, setGradeLocal] = useState({});

  // 1. FILTRAGEM ROBUSTA POR ESCOLA (Respeita o Header)
  const turmasFiltradas = useMemo(() => {
    return turmas.filter(t => {
      const idEscolaHeader = Number(escolaIdSelecionada);
      const idEscolaTurma = Number(t.escola_id);
      
      // Se tiver escola no header, filtra. Se não, mostra todas (ou ajuste conforme preferir)
      const pertenceAEscola = idEscolaHeader ? idEscolaTurma === idEscolaHeader : true;
      
      // Filtramos apenas turmas que possuem grade de horários (Iniciais e Finais)
      const ehNivelComGrade = t.nivel_ensino === 'Finais' || t.nivel_ensino === 'Iniciais';
      
      return pertenceAEscola && ehNivelComGrade;
    });
  }, [turmas, escolaIdSelecionada]);

  // 2. LIMPEZA AO TROCAR DE ESCOLA
  // Se mudar a escola lá em cima, resetamos a seleção para não mostrar lixo
  useEffect(() => {
    setTurmaSelecionadaId('');
    setGradeLocal({});
  }, [escolaIdSelecionada]);

  const turmaAtual = useMemo(() => 
    turmas.find(t => t.id === Number(turmaSelecionadaId)), 
  [turmaSelecionadaId, turmas]);

  // 3. DISCIPLINAS DINÂMICAS DO MOCK (Filtra pelo nível da turma)
  const disciplinasDisponiveis = useMemo(() => {
    if (!turmaAtual) return [];
    // Pega as disciplinas do mock que batem com o nível (Infantil/Iniciais/Finais)
    return MOCK_DATA.disciplinasPadrao?.filter(d => d.nivel === turmaAtual.nivel_ensino) || [];
  }, [turmaAtual]);

  const tempos = ['07:30 - 08:20', '08:20 - 09:10', '09:10 - 10:00', '10:20 - 11:10', '11:10 - 12:00'];
  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  const handleTurmaChange = (id) => {
    setTurmaSelecionadaId(id);
    const gradeExistente = gradeHorarios.find(g => g.turmaId === Number(id));
    setGradeLocal(gradeExistente?.grade || {});
  };

  const handleInputChange = (dia, tempo, campo, valor) => {
    setGradeLocal(prev => ({
      ...prev,
      [`${dia}-${tempo}`]: {
        ...prev[`${dia}-${tempo}`],
        [campo]: valor
      }
    }));
  };

  const handleSalvar = () => {
    if (!turmaSelecionadaId) return alert("Selecione uma turma primeiro!");
    salvarGradeHoraria(Number(turmaSelecionadaId), gradeLocal);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Matriz e Horários</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mt-2">
               <Filter size={10}/> {escolaIdSelecionada ? "Filtrado pela Unidade Selecionada" : "Exibindo Todas as Unidades"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={turmaSelecionadaId}
            onChange={(e) => handleTurmaChange(e.target.value)}
            className="bg-white border-none rounded-xl text-[11px] font-black uppercase p-3 shadow-sm focus:ring-2 focus:ring-primary min-w-[280px]"
          >
            <option value="">Selecionar Turma...</option>
            {turmasFiltradas.length > 0 ? (
              turmasFiltradas.map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.turno})</option>
              ))
            ) : (
              <option disabled>Nenhuma turma encontrada nesta escola</option>
            )}
          </select>
          <button 
            onClick={handleSalvar}
            className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase flex items-center gap-2 hover:bg-primary transition-all shadow-lg active:scale-95 disabled:opacity-50"
            disabled={!turmaSelecionadaId}
          >
            <Save size={16} /> Salvar Grade
          </button>
        </div>
      </div>

      {turmaSelecionadaId ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Horário</th>
                {diasSemana.map(dia => (
                  <th key={dia} className="p-6 text-[10px] font-black text-slate-400 uppercase border-l border-slate-100">{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tempos.map(tempo => (
                <tr key={tempo} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6 font-bold text-slate-400 text-xs whitespace-nowrap bg-slate-50/20">
                    <div className="flex items-center gap-2 font-black"><Clock size={14} className="text-primary"/> {tempo}</div>
                  </td>
                  {diasSemana.map(dia => (
                    <td key={`${dia}-${tempo}`} className="p-4 border-l border-slate-100 min-w-[210px]">
                      <div className="space-y-2">
                        {/* DROPDOWN DE DISCIPLINAS VINDO DO DATA.JS */}
                        <div className="relative">
                          <BookOpen size={12} className="absolute left-2.5 top-2.5 text-slate-400 z-10"/>
                          <select 
                            value={gradeLocal[`${dia}-${tempo}`]?.disciplina || ''}
                            onChange={(e) => handleInputChange(dia, tempo, 'disciplina', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                          >
                            <option value="">Disciplina...</option>
                            {disciplinasDisponiveis.map(d => (
                              <option key={d.id} value={d.nome}>{d.nome}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* SELECT DE PROFESSORES */}
                        <div className="relative">
                          <User size={12} className="absolute left-2.5 top-2.5 text-slate-400 z-10"/>
                          <select 
                            value={gradeLocal[`${dia}-${tempo}`]?.profId || ''}
                            onChange={(e) => handleInputChange(dia, tempo, 'profId', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-100 border-none rounded-lg text-[10px] font-black uppercase appearance-none cursor-pointer"
                          >
                            <option value="">Professor...</option>
                            {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                          </select>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <CalendarDays size={40} className="text-slate-200"/>
          </div>
          <p className="font-black text-[11px] uppercase tracking-widest text-center">
            {turmasFiltradas.length > 0 
              ? "Selecione uma turma para gerenciar a matriz horária" 
              : "Nenhuma turma disponível para a unidade selecionada"}
          </p>
          {!escolaIdSelecionada && (
            <span className="text-[9px] font-bold text-amber-500 mt-2 flex items-center gap-1 uppercase">
              <AlertCircle size={10}/> Selecione uma escola no topo para filtrar
            </span>
          )}
        </div>
      )}

      {salvoFeedback && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <div className="bg-white/20 p-1 rounded-lg"><CheckCircle size={20}/></div>
          <span className="text-[11px] font-black uppercase tracking-tight">Matriz Curricular Atualizada!</span>
        </div>
      )}
    </div>
  );
};

export default GestaoHorarios;