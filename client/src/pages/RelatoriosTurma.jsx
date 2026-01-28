import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Filter, BookOpen, AlertTriangle, X, Calendar, User } from 'lucide-react';
import { API_BASE_URL } from '../../infra/apiConfig';
// Import dos Gráficos
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RelatoriosTurma() {
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedAlocacao, setSelectedAlocacao] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [dadosStats, setDadosStats] = useState(null); // Dados gerais (Pizza + Lista)
  
  // Estado para o MODAL do Aluno
  const [alunoSelecionado, setAlunoSelecionado] = useState(null); // Se tiver dados, abre modal
  const [historicoAluno, setHistoricoAluno] = useState([]);

  // 1. Carrega as turmas
  useEffect(() => {
    axios.get(`${API_BASE_URL}/relatorios/turmas-ativas`)
      .then(res => setTurmas(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Quando seleciona turma, busca as disciplinas
  useEffect(() => {
    if (selectedTurma) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/relatorios/turmas/${selectedTurma}/disciplinas`)
        .then(res => {
            setDisciplinas(res.data);
            setSelectedAlocacao('');
            setDadosStats(null);
        })
        .finally(() => setLoading(false));
    } else {
        setDisciplinas([]);
    }
  }, [selectedTurma]);

  // 3. Quando seleciona a ALOCAÇÃO, busca os DADOS DOS GRÁFICOS (Igual ao do Professor)
  useEffect(() => {
      if (selectedAlocacao) {
          carregarEstatisticasGerais();
      }
  }, [selectedAlocacao]);

  const carregarEstatisticasGerais = async () => {
      try {
          // Reusamos a rota que criamos pro professor!
          const res = await axios.get(`${API_BASE_URL}/alocacoes/${selectedAlocacao}/estatisticas`);
          setDadosStats(res.data);
      } catch (error) {
          alert("Erro ao carregar métricas.");
      }
  };

  // 4. Função para abrir o "Raio-X" do Aluno
  const abrirDetalhesAluno = async (aluno) => {
      try {
          const res = await axios.get(`${API_BASE_URL}/relatorios/aluno/${aluno.matricula_id}/alocacao/${selectedAlocacao}`);
          setHistoricoAluno(res.data);
          setAlunoSelecionado(aluno); // Isso abre o modal
      } catch (error) {
          alert("Erro ao buscar histórico do aluno.");
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn pb-20">
      
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-conectiva-navy" /> 
            Relatórios de Desempenho
        </h1>
        <p className="text-gray-500">Selecione uma turma e uma disciplina para visualizar as métricas de frequência.</p>
      </div>

      {/* ÁREA DE FILTROS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">1. Selecione a Turma</label>
                  <div className="relative">
                      <select 
                        value={selectedTurma}
                        onChange={(e) => setSelectedTurma(e.target.value)}
                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-conectiva-navy appearance-none"
                      >
                          <option value="">-- Escolha uma turma --</option>
                          {turmas.map(t => (
                              <option key={t.id} value={t.id}>{t.codigo} - {t.nome_curso}</option>
                          ))}
                      </select>
                      <Filter size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                  </div>
              </div>

              <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">2. Selecione a Disciplina</label>
                  <div className="relative">
                      <select 
                        value={selectedAlocacao}
                        onChange={(e) => setSelectedAlocacao(e.target.value)}
                        disabled={!selectedTurma}
                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-conectiva-navy appearance-none disabled:opacity-50"
                      >
                          <option value="">
                              {loading ? "Carregando..." : selectedTurma ? "-- Escolha a matéria --" : "-- Selecione a turma primeiro --"}
                          </option>
                          {disciplinas.map(d => (
                              <option key={d.alocacao_id} value={d.alocacao_id}>
                                  {d.disciplina} (Prof. {d.professor.split(' ')[0]})
                              </option>
                          ))}
                      </select>
                      <BookOpen size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                  </div>
              </div>
          </div>
      </div>

      {/* --- DASHBOARD (SÓ APARECE SE TIVER DADOS) --- */}
      {selectedAlocacao && dadosStats && (
          <div className="animate-scaleIn">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                {/* CARD 1: Gráfico Geral da Turma */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-700 mb-2">Panorama Geral</h3>
                    <p className="text-sm text-gray-500 mb-6">Média de comparecimento da turma.</p>
                    
                    <div className="h-64 w-full flex justify-center">
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

                {/* CARD 2: Lista de Risco (Interativa) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-2">Monitoramento Individual</h3>
                    <p className="text-sm text-gray-500 mb-6">Clique no nome do aluno para ver o histórico detalhado.</p>

                    <div className="overflow-hidden rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Aluno</th>
                                    <th className="p-4 text-center">Faltas</th>
                                    <th className="p-4 w-1/3">Frequência</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dadosStats.alunos.map(aluno => {
                                    const perc = parseFloat(aluno.percentual);
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
                                        <tr 
                                            key={aluno.matricula_id} 
                                            onClick={() => abrirDetalhesAluno(aluno)}
                                            className="hover:bg-blue-50 cursor-pointer transition"
                                            title="Clique para ver detalhes"
                                        >
                                            <td className="p-4 font-medium text-gray-700">
                                                {icone} {aluno.nome}
                                            </td>
                                            <td className="p-4 text-center font-bold text-gray-800">{aluno.faltas}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${corBarra}`} style={{ width: `${perc}%` }}/>
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
          </div>
      )}

      {/* --- MODAL DE DETALHES DO ALUNO --- */}
      {alunoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="bg-conectiva-navy p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <User size={20} className="text-conectiva-lime"/> {alunoSelecionado.nome}
                    </h3>
                    <button onClick={() => setAlunoSelecionado(null)}><X size={24} className="text-white/70 hover:text-white"/></button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Resumo do Aluno */}
                    <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                        <div className="bg-green-50 p-2 rounded border border-green-100">
                            <p className="text-xs text-green-600 uppercase font-bold">Presenças</p>
                            <p className="text-xl font-bold text-green-700">{alunoSelecionado.presencas}</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-100">
                            <p className="text-xs text-red-600 uppercase font-bold">Faltas</p>
                            <p className="text-xl font-bold text-red-700">{alunoSelecionado.faltas}</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded border border-orange-100">
                            <p className="text-xs text-orange-600 uppercase font-bold">Justif.</p>
                            <p className="text-xl font-bold text-orange-700">{alunoSelecionado.justificados}</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                        <Calendar size={16}/> Histórico de Aulas
                    </h4>
                    
                    {historicoAluno.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center">Nenhum registro encontrado.</p>
                    ) : (
                        <div className="space-y-2">
                            {historicoAluno.map((reg, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                                    <div>
                                        <p className="font-bold text-gray-700">{new Date(reg.data_aula).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{reg.conteudo_ministrado}</p>
                                        {reg.observacao && <p className="text-xs text-orange-600 mt-1 italic">Obs: {reg.observacao}</p>}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        reg.status === 'Presente' ? 'bg-green-100 text-green-700' :
                                        reg.status === 'Ausente' ? 'bg-red-100 text-red-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {reg.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}