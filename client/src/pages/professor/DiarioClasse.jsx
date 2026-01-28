import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, CheckCircle, XCircle, FileText, Calendar, Edit2, RotateCcw, PieChart as IconPie, List as IconList, AlertTriangle, Trash2, Eye, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../../infra/apiConfig';

// --- IMPORTAÇÃO DOS GRÁFICOS ---
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DiarioClasse() {
  const { id } = useParams(); // ID da Alocação
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('diario'); // 'diario' ou 'estatisticas'
  const [loading, setLoading] = useState(true);
  const [contexto, setContexto] = useState(null); // Dados da Turma
  const [historico, setHistorico] = useState([]); // Aulas passadas
  
  // Estados do Diário
  const [chamada, setChamada] = useState({});
  const [observacoes, setObservacoes] = useState({});
  const [aulaEditandoId, setAulaEditandoId] = useState(null);

  const [aulaVisualizando, setAulaVisualizando] = useState(null);
  
  // Estados das Estatísticas
  const [dadosStats, setDadosStats] = useState(null);

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: { data_aula: new Date().toISOString().split('T')[0] }
  });

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    carregarDados();
  }, [id]);

  // Se trocar para a aba de estatísticas, carrega os dados
  useEffect(() => {
    if (activeTab === 'estatisticas') {
        carregarEstatisticas();
    }
  }, [activeTab]);

  const carregarDados = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/diario/${id}`);
      setContexto(res.data);
      
      // Inicializa chamada com Presente
      const inicial = {};
      res.data.alunos.forEach(a => inicial[a.matricula_id] = 'Presente');
      setChamada(inicial);
      
      carregarHistorico();
    } catch (error) {
      alert("Erro ao carregar turma.");
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/diario/${id}/aulas`);
        setHistorico(res.data);
    } catch (error) {
        console.error("Erro histórico");
    }
  };

  const carregarEstatisticas = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/alocacoes/${id}/estatisticas`);
          setDadosStats(res.data);
      } catch (error) {
          console.error("Erro stats");
      }
  };

  // --- FUNÇÕES DO DIÁRIO (IGUAIS AO ANTERIOR) ---
  const setStatusAluno = (idAluno, status) => {
    setChamada(prev => ({ ...prev, [idAluno]: status }));
    if (status !== 'Justificado') {
        setObservacoes(prev => {
            const nova = { ...prev };
            delete nova[idAluno];
            return nova;
        });
    }
  };

  // --- EXCLUIR AULA ---
const excluirAula = async (aulaId) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro de aula? Isso apagará as frequências lançadas.")) return;

    try {
        await axios.delete(`${API_BASE_URL}/aulas/${aulaId}`);
        alert("🗑️ Aula excluída!");
        carregarHistorico(); // Atualiza a lista
        if (activeTab === 'estatisticas') carregarEstatisticas(); // Atualiza gráficos se precisar
    } catch (error) {
        alert("Erro ao excluir.");
    }
};

// --- VISUALIZAR AULA (MODAL) ---
const verAula = async (aulaId) => {
    try {
        setLoading(true); // Opcional: loading rápido
        const { data } = await axios.get(`${API_BASE_URL}/aulas/${aulaId}`);
        
        // Monta o objeto pra exibir no modal
        setAulaVisualizando({
            dados: data.dados,
            frequencias: data.frequencias,
            // Truque: Junta o nome do aluno que já temos no contexto pra ficar bonito
            frequenciasDetalhadas: data.frequencias.map(f => {
                const alunoInfo = contexto.alunos.find(a => a.matricula_id === f.matricula_id);
                return { ...f, nome: alunoInfo ? alunoInfo.nome_completo : 'Desconhecido' };
            })
        });
    } catch (error) {
        alert("Erro ao carregar detalhes.");
    } finally {
        setLoading(false);
    }
};

  const carregarAulaParaEdicao = async (aulaId) => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/aulas/${aulaId}`);
        setValue('data_aula', data.dados.data_aula.split('T')[0]);
        setValue('conteudo', data.dados.conteudo_ministrado);
        
        const mapStatus = {};
        const mapObs = {};
        contexto.alunos.forEach(a => { mapStatus[a.matricula_id] = 'Presente'; }); // Default
        data.frequencias.forEach(f => {
            mapStatus[f.matricula_id] = f.status;
            mapObs[f.matricula_id] = f.observacao || '';
        });
        setChamada(mapStatus);
        setObservacoes(mapObs);
        setAulaEditandoId(aulaId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveTab('diario'); // Força volta pra aba diário
    } catch (error) { alert("Erro ao carregar aula."); }
  };

  const cancelarEdicao = () => {
    setAulaEditandoId(null);
    reset({ data_aula: new Date().toISOString().split('T')[0], conteudo: '' });
    const resetStatus = {};
    contexto.alunos.forEach(a => resetStatus[a.matricula_id] = 'Presente');
    setChamada(resetStatus);
    setObservacoes({});
  };

  const onSubmit = async (form) => {
    if (!form.conteudo) return alert("Preencha o conteúdo.");
    const payload = {
        turma_disciplina_id: contexto.turma_disciplina_id,
        professor_id: contexto.professor_id,
        data_aula: form.data_aula,
        conteudo: form.conteudo,
        frequencias: Object.keys(chamada).map(key => ({
            matricula_id: key, status: chamada[key], observacao: observacoes[key]
        }))
    };

    try {
        if (aulaEditandoId) {
            await axios.put(`${API_BASE_URL}/aulas/${aulaEditandoId}`, payload);
            alert("✅ Aula atualizada!");
        } else {
            await axios.post(`${API_BASE_URL}/diario/aula`, payload);
            alert("✅ Aula lançada!");
        }
        cancelarEdicao();
        carregarHistorico();
    } catch (error) { alert("Erro ao salvar."); }
  };

  if (loading) return <div className="p-8 text-center text-[#0f0155]">Carregando diário...</div>;

  return (
    <div className="animate-fadeIn pb-20">
      
      {/* --- CABEÇALHO DA DISCIPLINA --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <button onClick={() => navigate('/portal-professor')} className="flex items-center text-gray-500 hover:text-[#0f0155] mb-2 text-sm transition">
                <ArrowLeft size={16} className="mr-1" /> Voltar para Turmas
            </button>
            <h1 className="text-2xl font-bold text-[#0f0155]">{contexto?.disciplina}</h1>
            <p className="text-gray-500">{contexto?.curso} • {contexto?.turma}</p>
        </div>
      </div>

      {/* --- NAVEGAÇÃO POR ABAS (TABS) --- */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab('diario')}
            className={`pb-3 px-2 flex items-center gap-2 font-medium transition border-b-2 ${activeTab === 'diario' ? 'border-[#bcfe2b] text-[#0f0155]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <IconList size={18}/> Diário de Classe
          </button>
          <button 
            onClick={() => setActiveTab('estatisticas')}
            className={`pb-3 px-2 flex items-center gap-2 font-medium transition border-b-2 ${activeTab === 'estatisticas' ? 'border-[#bcfe2b] text-[#0f0155]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <IconPie size={18}/> Desempenho & Métricas
          </button>
      </div>

      {/* =================================================================================
          CONTEÚDO DA ABA 1: DIÁRIO (LANÇAMENTO)
         ================================================================================= */}
      {activeTab === 'diario' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* ... (SEU CÓDIGO DO FORMULÁRIO DE AULA MANTIDO AQUI) ... */}
            {/* COLUNA ESQUERDA: Formulário e Chamada */}
            <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${aulaEditandoId ? 'text-orange-600' : 'text-gray-700'}`}>
                        {aulaEditandoId ? <Edit2 size={18}/> : <Calendar size={18}/>} 
                        {aulaEditandoId ? 'Editando Registro Anterior' : 'Novo Registro de Aula'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                            <input type="date" {...register('data_aula')} className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#0f0155]" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conteúdo Ministrado</label>
                            <input type="text" {...register('conteudo')} placeholder="Ex: Introdução à Anatomia Humana..." className="w-full p-2 border border-gray-200 rounded outline-none focus:border-[#0f0155]" />
                        </div>
                    </div>

                    {/* LISTA DE ALUNOS (CHAMADA) - CORRIGIDA */}
<div className="border rounded-lg overflow-hidden mb-6">
    <div className="bg-gray-50 p-3 border-b text-xs font-bold text-gray-500 uppercase flex justify-between">
        <span>Aluno</span>
        <span>Presença</span>
    </div>

    {/* 1. REMOVI O 'divide-y divide-gray-100' DAQUI */}
    <div className="max-h-[400px] overflow-y-auto flex flex-col"> 
        {contexto?.alunos.map(aluno => {
            const status = chamada[aluno.matricula_id];
            
            // Lógica das cores
            let borderClass = 'border-l-4 border-l-green-500'; 
            if (status === 'Ausente') borderClass = 'border-l-4 border-l-red-500';
            if (status === 'Justificado') borderClass = 'border-l-4 border-l-orange-400';

            return (
                <div 
                    key={aluno.matricula_id} 
                    // 2. ADICIONEI 'border-b border-gray-100 last:border-b-0' PARA AS LINHAS APARECERE SEM SUMIR A COR
                    className={`p-3 bg-white hover:bg-gray-50 transition flex items-center justify-between ${borderClass} border-b border-gray-100 last:border-b-0`}
                >
                    <div>
                        <p className="font-bold text-sm text-gray-800">{aluno.nome_completo}</p>
                        
                        {status === 'Justificado' && (
                            <input 
                                type="text" 
                                placeholder="Motivo..."
                                className="mt-1 text-xs p-1 border border-orange-200 bg-orange-50 rounded w-full outline-none"
                                value={observacoes[aluno.matricula_id] || ''}
                                onChange={e => setObservacoes({...observacoes, [aluno.matricula_id]: e.target.value})}
                            />
                        )}
                    </div>
                    <div className="flex gap-1">
                        <button type="button" onClick={() => setStatusAluno(aluno.matricula_id, 'Presente')} className={`p-1.5 rounded ${status === 'Presente' ? 'bg-green-100 text-green-700' : 'text-gray-300'}`}><CheckCircle size={18}/></button>
                        <button type="button" onClick={() => setStatusAluno(aluno.matricula_id, 'Ausente')} className={`p-1.5 rounded ${status === 'Ausente' ? 'bg-red-100 text-red-700' : 'text-gray-300'}`}><XCircle size={18}/></button>
                        <button type="button" onClick={() => setStatusAluno(aluno.matricula_id, 'Justificado')} className={`p-1.5 rounded ${status === 'Justificado' ? 'bg-orange-100 text-orange-700' : 'text-gray-300'}`}><FileText size={18}/></button>
                    </div>
                </div>
            )
        })}
    </div>
</div>

                    {/* BOTÕES DE AÇÃO */}
                    <div className="flex gap-2">
                        {aulaEditandoId && (
                            <button type="button" onClick={cancelarEdicao} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
                                <RotateCcw size={18}/> Cancelar
                            </button>
                        )}
                        <button type="submit" className={`flex-1 ${aulaEditandoId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#0f0155] hover:bg-blue-900'} text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg`}>
                            <Save size={18}/> {aulaEditandoId ? 'Salvar Alterações' : 'Salvar Diário'}
                        </button>
                    </div>
                </form>
            </div>

            {/* COLUNA DIREITA: Histórico */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-[#0f0155]"/> Histórico de Aulas
                </h3>
                {historico.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhuma aula registrada.</p>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {historico.map(aula => (
                            <div key={aula.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition group relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-[#0f0155] uppercase">
                                            {new Date(aula.data_aula).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={aula.conteudo_ministrado}>
                                            {aula.conteudo_ministrado}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
    {/* BOTÃO VER (OLHO) */}
    <button 
        onClick={() => verAula(aula.id)}
        className="text-gray-300 hover:text-blue-500 p-1 transition"
        title="Visualizar Detalhes"
    >
        <Eye size={16}/>
    </button>

    {/* BOTÃO EDITAR (LÁPIS - Já existia) */}
    <button 
        onClick={() => carregarAulaParaEdicao(aula.id)}
        className="text-gray-300 hover:text-orange-500 p-1 transition"
        title="Editar Aula"
    >
        <Edit2 size={16}/>
    </button>

    {/* BOTÃO EXCLUIR (LIXEIRA) */}
    <button 
        onClick={() => excluirAula(aula.id)}
        className="text-gray-300 hover:text-red-500 p-1 transition"
        title="Excluir Registro"
    >
        <Trash2 size={16}/>
    </button>
</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
      )}

      {/* =================================================================================
          CONTEÚDO DA ABA 2: ESTATÍSTICAS (NOVO!)
         ================================================================================= */}
      {activeTab === 'estatisticas' && (
          <div className="animate-fadeIn">
              
              {!dadosStats ? (
                  <div className="text-center py-10 text-gray-400">Calculando métricas...</div>
              ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* CARD 1: Gráfico Geral da Turma */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-700 mb-2">Panorama Geral</h3>
                          <p className="text-sm text-gray-500 mb-6">Distribuição total de presenças e faltas da turma.</p>
                          
                          <div className="h-64 w-full flex justify-center">
                            {/* Verifica se tem dados pra não quebrar o gráfico */}
                            {dadosStats.resumo.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                                <div className="flex items-center justify-center text-gray-300 text-sm">Sem dados suficientes</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dadosStats.resumo}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dadosStats.resumo.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                          </div>
                      </div>

                      {/* CARD 2: Lista de Risco (Semáforo) */}
                      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-700 mb-2">Desempenho Individual</h3>
                          <p className="text-sm text-gray-500 mb-6">Monitoramento de frequência por aluno (Ordenado por Risco).</p>

                          <div className="overflow-hidden rounded-lg border border-gray-100">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                      <tr>
                                          <th className="p-4">Aluno</th>
                                          <th className="p-4 text-center">Aulas</th>
                                          <th className="p-4 text-center">Faltas</th>
                                          <th className="p-4 w-1/3">Frequência</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                      {dadosStats.alunos.map(aluno => {
                                          const perc = parseFloat(aluno.percentual);
                                          // Definição das Cores do Semáforo
                                          let corBarra = 'bg-green-500';
                                          let corTexto = 'text-green-600';
                                          let icone = null;

                                          if (perc < 75) {
                                              corBarra = 'bg-red-500';
                                              corTexto = 'text-red-600';
                                              icone = <AlertTriangle size={14} className="text-red-500 inline mr-1" />;
                                          } else if (perc < 85) {
                                              corBarra = 'bg-yellow-400';
                                              corTexto = 'text-yellow-600';
                                          }

                                          return (
                                              <tr key={aluno.matricula_id} className="hover:bg-gray-50">
                                                  <td className="p-4 font-medium text-gray-700">
                                                      {icone} {aluno.nome}
                                                  </td>
                                                  <td className="p-4 text-center text-gray-500">{aluno.total_aulas}</td>
                                                  <td className="p-4 text-center font-bold text-gray-800">{aluno.faltas}</td>
                                                  <td className="p-4">
                                                      <div className="flex items-center gap-3">
                                                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                              <div 
                                                                className={`h-full ${corBarra}`} 
                                                                style={{ width: `${perc}%` }}
                                                              />
                                                          </div>
                                                          <span className={`font-bold w-12 text-right ${corTexto}`}>{perc}%</span>
                                                      </div>
                                                  </td>
                                              </tr>
                                          );
                                      })}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- MODAL DE VISUALIZAÇÃO --- */}
{aulaVisualizando && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
            
            {/* Cabeçalho do Modal */}
            <div className="bg-[#0f0155] p-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Calendar size={20} className="text-[#bcfe2b]"/> Detalhes da Aula Registrada
                </h3>
                <button onClick={() => setAulaVisualizando(null)} className="text-white/70 hover:text-white transition">
                    <X size={24}/>
                </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
                
                {/* Info Principal */}
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-1">Conteúdo Ministrado</p>
                    <p className="text-gray-800 font-medium text-lg">{aulaVisualizando.dados.conteudo}</p>
                    <div className="mt-2 pt-2 border-t border-blue-200 text-sm text-blue-700">
                        Data: <strong>{new Date(aulaVisualizando.dados.data_aula).toLocaleDateString()}</strong>
                    </div>
                </div>

                {/* Lista de Presença no Modal */}
                <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Registro de Frequência</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aulaVisualizando.frequenciasDetalhadas.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-2 border border-gray-100 rounded bg-gray-50">
                            <span className="text-sm font-medium text-gray-700 truncate mr-2" title={f.nome}>
                                {f.nome}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                f.status === 'Presente' ? 'bg-green-100 text-green-700 border-green-200' :
                                f.status === 'Ausente' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-orange-100 text-orange-700 border-orange-200'
                            }`}>
                                {f.status}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Se tiver justificativas */}
                {aulaVisualizando.frequenciasDetalhadas.some(f => f.observacao) && (
                    <div className="mt-6">
                        <h4 className="font-bold text-gray-700 mb-2 text-sm">Observações / Justificativas</h4>
                        <ul className="space-y-2">
                            {aulaVisualizando.frequenciasDetalhadas.filter(f => f.observacao).map(f => (
                                <li key={f.id} className="text-sm p-2 bg-orange-50 border border-orange-100 rounded text-orange-800">
                                    <strong>{f.nome}:</strong> {f.observacao}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-gray-50 text-right">
                <button 
                    onClick={() => setAulaVisualizando(null)} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg transition"
                >
                    Fechar
                </button>
            </div>
        </div>
    </div>
)}

    </div>
  );
}