import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Calendar, Clock, Users, Trash2, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../infra/apiConfig';
import { useForm } from 'react-hook-form';

export default function ListaTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Configuração do react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      curso_id: '',
      periodo: '2026.1',
      turno: 'Noite',
      data_inicio: '',
      data_fim: ''
    }
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resTurmas, resCursos] = await Promise.all([
        axios.get(`${API_BASE_URL}/turmas`),
        axios.get(`${API_BASE_URL}/cursos`)
      ]);
      setTurmas(resTurmas.data);
      setCursos(resCursos.data);
      if (resCursos.data.length > 0) {
        setValue('curso_id', resCursos.data[0].id);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar data para YYYY-MM-DD (input date)
  const formatarDataParaInput = (data) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toISOString().split('T')[0];
  };

  const criarTurma = async (data) => {
    try {
      await axios.post(`${API_BASE_URL}/turmas`, data);
      setModalAberto(false);
      reset(); // Limpa o formulário
      carregarDados();
      alert("✅ Turma criada!");
    } catch (error) {
      alert("Erro ao criar turma.");
    }
  };

  const excluirTurma = async (id) => {
    // Confirmação inicial
    if (!window.confirm("Tem certeza que deseja tentar excluir esta turma?")) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/turmas/${id}`);
      
      // Se deu certo (Status 200)
      setTurmas(prev => prev.filter(t => t.id !== id));
      alert("✅ Turma removida com sucesso!");
      
    } catch (error) {
      // Se deu erro (Status 409 ou 500)
      // O texto que colocamos no backend vem em error.response.data.error
      const mensagemErro = error.response?.data?.error || "Erro desconhecido ao excluir.";
      
      // Mostra a mensagem explicativa pra coordenadora
      alert(`⚠️ Ação Bloqueada:\n${mensagemErro}`);
    }
  };

  // Fechar modal e resetar form
  const fecharModal = () => {
    setModalAberto(false);
    reset();
  };

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-conectiva-navy">Gestão de Turmas</h1>
          <p className="text-gray-500">Administre os períodos letivos e enturmação.</p>
        </div>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-conectiva-lime text-conectiva-navy px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-[#bfff00] shadow-lg transition"
        >
          <Plus size={20} />
          Abrir Nova Turma
        </button>
      </div>

      {/* --- GRID DE TURMAS --- */}
      {loading ? (
        <p className="text-center py-10 text-gray-500">Carregando...</p>
      ) : turmas.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <GraduationCap size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhuma turma aberta no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {turmas.map((turma) => (
            <div key={turma.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
              
              <div className={`h-2 w-full ${turma.ativa ? 'bg-conectiva-lime' : 'bg-gray-300'}`} />

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{turma.codigo}</h3>
                        <p className="text-sm text-gray-500">{turma.nome_curso}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${turma.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {turma.ativa ? 'Em Andamento' : 'Encerrada'}
                    </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-conectiva-navy" />
                        <span>{turma.periodo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-conectiva-navy" />
                        <span>{turma.turno}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-conectiva-navy" />
                        <span><strong>{turma.total_alunos}</strong> alunos matriculados</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link 
                        to={`/turmas/${turma.id}`}
                        className="flex-1 bg-conectiva-navy text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-800 transition"
                    >
                        Gerenciar <ArrowRight size={16} />
                    </Link>
                    <button 
                        onClick={() => excluirTurma(turma.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Turma"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE CRIAÇÃO com react-hook-form --- */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Nova Turma</h2>
                    <button 
                      onClick={fecharModal} 
                      className="text-gray-400 hover:text-red-500"
                      type="button"
                    >
                      <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(criarTurma)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Curso *</label>
                        <select 
                            className={`w-full p-2 border rounded-lg ${errors.curso_id ? 'border-red-500' : 'border-gray-300'}`}
                            {...register('curso_id', { required: 'Selecione um curso' })}
                        >
                            <option value="">Selecione um curso</option>
                            {cursos.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                        {errors.curso_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.curso_id.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Período/Ano *</label>
                            <input 
                                type="text"
                                className={`w-full p-2 border rounded-lg ${errors.periodo ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ex: 2026.1"
                                {...register('periodo', { 
                                  required: 'Período é obrigatório',
                                  pattern: {
                                    value: /^\d{4}\.\d$/,
                                    message: 'Formato inválido. Use: YYYY.N (ex: 2026.1)'
                                  }
                                })}
                            />
                            {errors.periodo && (
                              <p className="mt-1 text-sm text-red-600">{errors.periodo.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Turno *</label>
                            <select 
                                className={`w-full p-2 border rounded-lg ${errors.turno ? 'border-red-500' : 'border-gray-300'}`}
                                {...register('turno', { required: 'Selecione o turno' })}
                            >
                                <option value="">Selecione</option>
                                <option value="Manhã">Manhã</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noite">Noite</option>
                                <option value="Integral">Integral</option>
                            </select>
                            {errors.turno && (
                              <p className="mt-1 text-sm text-red-600">{errors.turno.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início *</label>
                            <input 
                              type="date" 
                              className={`w-full p-2 border rounded-lg ${errors.data_inicio ? 'border-red-500' : 'border-gray-300'}`}
                              {...register('data_inicio', { 
                                required: 'Data de início é obrigatória',
                                validate: value => {
                                  const dataInicio = new Date(value);
                                  const hoje = new Date();
                                  hoje.setHours(0, 0, 0, 0);
                                  return dataInicio >= hoje || 'Data não pode ser no passado';
                                }
                              })}
                            />
                            {errors.data_inicio && (
                              <p className="mt-1 text-sm text-red-600">{errors.data_inicio.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim *</label>
                            <input 
                              type="date" 
                              className={`w-full p-2 border rounded-lg ${errors.data_fim ? 'border-red-500' : 'border-gray-300'}`}
                              {...register('data_fim', { 
                                required: 'Data de término é obrigatória',
                                validate: value => {
                                  const dataInicio = watch('data_inicio');
                                  if (!dataInicio) return true;
                                  const dataFim = new Date(value);
                                  const inicio = new Date(dataInicio);
                                  return dataFim > inicio || 'Data fim deve ser posterior à data início';
                                }
                              })}
                            />
                            {errors.data_fim && (
                              <p className="mt-1 text-sm text-red-600">{errors.data_fim.message}</p>
                            )}
                        </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-conectiva-lime text-conectiva-navy font-bold py-3 rounded-lg hover:bg-[#bfff00] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg"
                    >
                      {isSubmitting ? 'Criando...' : 'Criar Turma'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}