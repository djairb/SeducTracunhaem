import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book, Users, Plus, X, GraduationCap, Calendar, Trash2, ArrowLeft, CheckSquare, Square, UserMinus, Search, Power, History, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form'; // <--- O REI DA VALIDAÇÃO
import { API_BASE_URL } from '../../infra/apiConfig';

export default function GerenciarTurma() {
    const { id } = useParams();
    const [turma, setTurma] = useState(null);
    const [activeTab, setActiveTab] = useState('disciplinas'); // disciplinas | professores | alunos

    // DADOS DAS LISTAS
    const [grade, setGrade] = useState([]);
    const [professoresAlocados, setProfessoresAlocados] = useState([]);

    // DADOS PARA OS SELECTS (Opções disponíveis)
    const [catalogoDisciplinas, setCatalogoDisciplinas] = useState([]);
    const [listaProfessores, setListaProfessores] = useState([]);

    // CONTROLE DE MODAIS
    const [modalDiscOpen, setModalDiscOpen] = useState(false);
    const [modalProfOpen, setModalProfOpen] = useState(false);
    const [buscaAlunos, setBuscaAlunos] = useState('');

    const [matriculados, setMatriculados] = useState([]);
    const [disponiveis, setDisponiveis] = useState([]);
    const [selecionados, setSelecionados] = useState([]); // Array de IDs marcados [1, 5, ...]
    const [modoAdicao, setModoAdicao] = useState(false);

    const alunosFiltrados = disponiveis.filter(aluno =>
        aluno.nome_completo.toLowerCase().includes(buscaAlunos.toLowerCase()) ||
        aluno.cpf.includes(buscaAlunos)
    );

    // FUNÇÃO DE REMOVER DISCIPLINA
    const removerDisciplina = async (idTurmaDisciplina) => {
        if (!window.confirm("Remover esta disciplina da grade da turma?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/turmas/disciplinas/${idTurmaDisciplina}`);
            setGrade(prev => prev.filter(item => item.id !== idTurmaDisciplina));
            alert("✅ Disciplina removida.");
        } catch (error) {
            const msg = error.response?.data?.error || "Erro ao remover.";
            alert(`❌ ${msg}`);
        }
    };

    // --- HOOK FORMS ---
    // Form 1: Adicionar Disciplina
    const {
        register: regDisc,
        handleSubmit: subDisc,
        reset: resetDisc,
        formState: { errors: errDisc }
    } = useForm();

    // Form 2: Alocar Professor
    const {
        register: regProf,
        handleSubmit: subProf,
        reset: resetProf,
        formState: { errors: errProf }
    } = useForm();

    useEffect(() => {
        carregarTurma();
        carregarGrade();
        carregarProfessoresAlocados();
        carregarListasAuxiliares();
        if (activeTab === 'alunos') {
            carregarMatriculados();
            carregarDisponiveis();
        }
    }, [id, activeTab]);
    // --- LOADS ---
    const carregarTurma = async () => axios.get(`${API_BASE_URL}/turmas/${id}`).then(res => setTurma(res.data));
    const carregarGrade = async () => axios.get(`${API_BASE_URL}/turmas/${id}/disciplinas`).then(res => setGrade(res.data));
    const carregarProfessoresAlocados = async () => axios.get(`${API_BASE_URL}/turmas/${id}/professores`).then(res => setProfessoresAlocados(res.data));
    const carregarMatriculados = async () => axios.get(`${API_BASE_URL}/turmas/${id}/matriculados`).then(res => setMatriculados(res.data));
    const carregarDisponiveis = async () => axios.get(`${API_BASE_URL}/turmas/${id}/disponiveis`).then(res => setDisponiveis(res.data));

    const carregarListasAuxiliares = async () => {
        const [resDisc, resProf] = await Promise.all([
            axios.get(`${API_BASE_URL}/disciplinas`),
            axios.get(`${API_BASE_URL}/professores`)
        ]);
        setCatalogoDisciplinas(resDisc.data);
        setListaProfessores(resProf.data);
    };

    const toggleSelecao = (alunoId) => {
        setSelecionados(prev =>
            prev.includes(alunoId)
                ? prev.filter(id => id !== alunoId) // Remove se já tiver
                : [...prev, alunoId] // Adiciona se não tiver
        );
    };

    const reintegrarProfessor = async (alocacaoAntigaId) => {
        if (!window.confirm("Confirmar o retorno deste professor à turma a partir de hoje?")) return;

        try {
            await axios.post(`${API_BASE_URL}/alocacoes/${alocacaoAntigaId}/reintegrar`);
            alert("✅ Professor reintegrado!");
            carregarProfessoresAlocados(); // Recarrega tudo pra mostrar o novo card ativo
        } catch (error) {
            alert("Erro ao reintegrar.");
        }
    };

    // FUNÇÃO NOVA: ENCERRAR (DESATIVAR)
    const encerrarAlocacao = async (alocacaoId) => {
        if (!window.confirm("Confirmar o encerramento da atuação deste professor? Ele ficará salvo no histórico.")) return;

        try {
            await axios.patch(`${API_BASE_URL}/alocacoes/${alocacaoId}/encerrar`);
            alert("✅ Alocação encerrada.");
            // Atualiza a lista localmente para refletir a mudança sem recarregar tudo
            setProfessoresAlocados(prev => prev.map(p =>
                p.id === alocacaoId ? { ...p, ativo: 0, data_fim: new Date().toISOString() } : p
            ));
        } catch (error) {
            alert("Erro ao encerrar.");
        }
    };

    const desvincularProfessor = async (alocacaoId) => {
        if (!window.confirm("Tem certeza que deseja remover este professor desta matéria?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/alocacoes/${alocacaoId}`);
            alert("✅ Professor removido.");
            // Atualiza a lista na tela
            setProfessoresAlocados(prev => prev.filter(p => p.id !== alocacaoId));
        } catch (error) {
            // Mostra a mensagem bonitinha que mandamos no backend (ex: se tiver aula gravada)
            const msg = error.response?.data?.error || "Erro ao remover.";
            alert(`❌ ${msg}`);
        }
    };

    const realizarMatricula = async () => {
        if (selecionados.length === 0) return alert("Selecione pelo menos um aluno.");

        try {
            await axios.post(`${API_BASE_URL}/turmas/${id}/matriculas`, { alunos_ids: selecionados });
            alert("✅ Alunos matriculados com sucesso!");
            setSelecionados([]);
            setModoAdicao(false);
            carregarMatriculados(); // Atualiza a lista principal
        } catch (error) {
            alert("Erro ao matricular.");
        }
    };

    // REMOVER ALUNO
    const removerMatricula = async (matriculaId) => {
        if (!window.confirm("Remover este aluno da turma?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/matriculas/${matriculaId}`);
            setMatriculados(prev => prev.filter(m => m.matricula_id !== matriculaId));
        } catch (error) {
            alert("Erro ao remover.");
        }
    };

    // --- ACTIONS (SUBMITS) ---

    const onSubmitDisciplina = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/turmas/${id}/disciplinas`, data);
            alert("✅ Matéria adicionada à grade!");
            setModalDiscOpen(false);
            resetDisc();
            carregarGrade(); // Atualiza a lista
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao adicionar.");
        }
    };

    const onSubmitProfessor = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/alocacoes`, data);
            alert("✅ Professor alocado com sucesso!");
            setModalProfOpen(false);
            resetProf();
            carregarProfessoresAlocados();
        } catch (error) {
    // Vai pegar a mensagem "Este professor já está alocado..." que mandamos no backend
    const msg = error.response?.data?.error || "Erro ao alocar.";
    alert(`❌ ${msg}`);
}
    };

    if (!turma) return <div className="p-8 text-center text-gray-500">Carregando turma...</div>;

    return (
        <div className="animate-fadeIn">

            {/* --- CABEÇALHO --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-3 mb-4 text-gray-500 text-sm">
                    <Link to="/turmas" className="hover:text-conectiva-navy flex items-center gap-1"><ArrowLeft size={14} /> Voltar para Turmas</Link>
                    <span>/</span>
                    <span>Gerenciamento</span>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-conectiva-navy">{turma.codigo}</h1>
                        <p className="text-gray-600">{turma.nome_curso} • {turma.turno}</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${turma.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {turma.ativa ? 'Ativa' : 'Encerrada'}
                    </div>
                </div>
            </div>

            {/* --- NAVEGAÇÃO (TABS) --- */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('disciplinas')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${activeTab === 'disciplinas' ? 'border-conectiva-navy text-conectiva-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Book size={18} /> Grade Curricular
                </button>
                <button
                    onClick={() => setActiveTab('professores')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${activeTab === 'professores' ? 'border-conectiva-navy text-conectiva-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <GraduationCap size={18} /> Professores
                </button>
                <button
                    onClick={() => setActiveTab('alunos')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${activeTab === 'alunos' ? 'border-conectiva-navy text-conectiva-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Users size={18} /> Alunos (Matrículas)
                </button>
            </div>

            {/* ================= CONTEÚDO DAS ABAS ================= */}

            {/* 1. ABA DISCIPLINAS */}
            {activeTab === 'disciplinas' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-700">Grade da Turma ({grade.length})</h2>
                        <button onClick={() => setModalDiscOpen(true)} className="btn-add">
                            <Plus size={16} /> Adicionar Matéria
                        </button>
                    </div>

                    {grade.length === 0 ? (
                        <div className="empty-state">Nenhuma matéria adicionada a esta turma ainda.</div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-bold text-gray-500">
                                    <tr>
                                        <th className="p-4">Disciplina</th>
                                        <th className="p-4">Carga Horária</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {grade.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-800">{item.nome}</td>
                                            <td className="p-4">{item.carga_horaria}h</td>
                                            {/* ... dentro do map da grade ... */}
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => removerDisciplina(item.id)} // <--- AQUI
                                                    className="text-gray-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                                                    title="Remover da Grade"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* 2. ABA PROFESSORES ATUALIZADA */}
            {activeTab === 'professores' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-700">Corpo Docente</h2>
                        <button onClick={() => setModalProfOpen(true)} className="btn-add">
                            <Plus size={16} /> Alocar Professor
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {professoresAlocados.map(aloc => (
                            <div key={aloc.id} className={`p-4 rounded-xl border flex justify-between items-start transition-all ${aloc.ativo ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>

                                {/* Lado Esquerdo: Dados */}
                                <div>
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        {aloc.nome_completo}
                                        {!aloc.ativo && <History size={14} className="text-gray-400" />}
                                    </h4>

                                    <div className="text-sm text-conectiva-navy font-medium flex items-center gap-1 mt-1">
                                        <Book size={14} /> {aloc.disciplina}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                Início: {new Date(aloc.data_inicio).toLocaleDateString('pt-BR')}
                                            </span>
                                            {/* Se tiver data fim, mostra */}
                                            {aloc.data_fim && (
                                                <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100">
                                                    Fim: {new Date(aloc.data_fim).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lado Direito: Ações */}
                                <div className="flex flex-col gap-2">
                                    {aloc.ativo ? (
                                        // SE TIVER ATIVO: Botão de Encerrar (Power)
                                        <>
                                            <button
                                                onClick={() => encerrarAlocacao(aloc.id)}
                                                className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-2 rounded-full transition"
                                                title="Encerrar Contrato (Pausa)"
                                            >
                                                <Power size={18} />
                                            </button>
                                            <button
                                                onClick={() => desvincularProfessor(aloc.id)}
                                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                                title="Excluir (Erro)"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        // SE TIVER INATIVO: Botão de Retorno (Refresh)
                                        <>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase border border-gray-200 px-2 py-1 rounded mb-1 text-center">
                                                Encerrado
                                            </span>
                                            <button
                                                onClick={() => reintegrarProfessor(aloc.id)}
                                                className="text-conectiva-navy bg-blue-50 hover:bg-conectiva-navy hover:text-white p-2 rounded-full transition shadow-sm"
                                                title="Reintegrar Professor"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. ABA ALUNOS (ATUALIZADA) */}

            {activeTab === 'alunos' && (
                <div>
                    {/* MODO VISUALIZAÇÃO (LISTA DE QUEM JÁ TÁ NA TURMA) */}
                    {!modoAdicao ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-700">Alunos Matriculados ({matriculados.length})</h2>
                                <button
                                    onClick={() => { setModoAdicao(true); setBuscaAlunos(''); carregarDisponiveis(); }}
                                    className="btn-add"
                                >
                                    <Plus size={16} /> Matricular Alunos
                                </button>
                            </div>

                            {matriculados.length === 0 ? (
                                <div className="empty-state">Nenhum aluno matriculado nesta turma.</div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left text-sm text-gray-600">
                                        <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-bold text-gray-500">
                                            <tr>
                                                <th className="p-4">Nome do Aluno</th>
                                                <th className="p-4">Matrícula</th>
                                                <th className="p-4">Celular</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {matriculados.map(m => (
                                                <tr key={m.matricula_id} className="hover:bg-gray-50">
                                                    <td className="p-4 font-bold text-gray-800">{m.nome_completo}</td>
                                                    <td className="p-4 font-mono text-xs bg-slate-50 rounded w-fit">{m.numero_matricula}</td>
                                                    <td className="p-4">{m.telefone_celular}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${m.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {m.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => removerMatricula(m.matricula_id)} className="text-gray-400 hover:text-red-600" title="Desvincular">
                                                            <UserMinus size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        // MODO ADIÇÃO (SELEÇÃO EM MASSA COM FILTRO)
                        <div className="animate-fadeIn">

                            {/* CABEÇALHO DA SELEÇÃO */}
                            <div className="flex justify-between items-center mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => { setModoAdicao(false); setBuscaAlunos(''); }} className="text-gray-500 hover:text-conectiva-navy">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h2 className="font-bold text-blue-900">Selecionar Alunos</h2>
                                        <p className="text-xs text-blue-600">{selecionados.length} alunos selecionados</p>
                                    </div>
                                </div>
                                <button
                                    onClick={realizarMatricula}
                                    disabled={selecionados.length === 0}
                                    className="bg-conectiva-navy text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 transition"
                                >
                                    Confirmar Matrícula
                                </button>
                            </div>

                            {/* BARRA DE PESQUISA */}
                            <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4 flex items-center gap-2 shadow-sm">
                                <Search className="text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Filtrar por nome ou CPF..."
                                    className="flex-1 outline-none text-gray-600 placeholder-gray-400"
                                    value={buscaAlunos}
                                    onChange={(e) => setBuscaAlunos(e.target.value)}
                                    autoFocus
                                />
                                {buscaAlunos && (
                                    <button onClick={() => setBuscaAlunos('')} className="text-xs font-bold text-gray-400 hover:text-gray-600">LIMPAR</button>
                                )}
                            </div>

                            {/* LISTA DE ALUNOS DISPONÍVEIS (FILTRADA) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {alunosFiltrados.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        {disponiveis.length === 0
                                            ? "Todos os alunos ativos já estão matriculados! 🎉"
                                            : "Nenhum aluno encontrado com esse nome."}
                                    </div>
                                ) : (
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-left text-sm text-gray-600">
                                            <thead className="bg-gray-50 sticky top-0 border-b border-gray-100 uppercase text-xs font-bold text-gray-500">
                                                <tr>
                                                    <th className="p-4 w-10">Select</th>
                                                    <th className="p-4">Nome</th>
                                                    <th className="p-4">CPF</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {alunosFiltrados.map(aluno => {
                                                    const isSelected = selecionados.includes(aluno.id);
                                                    return (
                                                        <tr
                                                            key={aluno.id}
                                                            onClick={() => toggleSelecao(aluno.id)}
                                                            className={`cursor-pointer transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className="p-4">
                                                                {isSelected
                                                                    ? <CheckSquare size={20} className="text-conectiva-navy" />
                                                                    : <Square size={20} className="text-gray-300" />
                                                                }
                                                            </td>
                                                            <td className="p-4 font-medium text-gray-800">
                                                                {aluno.nome_completo}
                                                            </td>
                                                            <td className="p-4">{aluno.cpf}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================= MODAIS COM REACT HOOK FORM ================= */}

            {/* MODAL 1: ADICIONAR DISCIPLINA */}
            {modalDiscOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Adicionar Matéria à Turma</h3>
                            <button onClick={() => setModalDiscOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={subDisc(onSubmitDisciplina)} className="space-y-4">
                            <div>
                                <label className="label">Selecione a Disciplina *</label>
                                <select
                                    {...regDisc("disciplina_id", { required: "Selecione uma opção" })}
                                    className={`input-base ${errDisc.disciplina_id ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Selecione...</option>
                                    {catalogoDisciplinas.map(d => (
                                        <option key={d.id} value={d.id}>{d.nome} ({d.carga_horaria}h) - {d.nome_curso}</option>
                                    ))}
                                </select>
                                {errDisc.disciplina_id && <span className="error-msg">{errDisc.disciplina_id.message}</span>}
                            </div>
                            <button type="submit" className="btn-primary w-full">Adicionar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ALOCAR PROFESSOR */}
            {modalProfOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Alocar Professor</h3>
                            <button onClick={() => setModalProfOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={subProf(onSubmitProfessor)} className="space-y-4">

                            {/* 1. Escolher a Matéria desta Turma */}
                            <div>
                                <label className="label">Disciplina da Turma *</label>
                                <select
                                    {...regProf("turma_disciplina_id", { required: "Qual aula ele vai dar?" })}
                                    className="input-base"
                                >
                                    <option value="">Selecione a matéria...</option>
                                    {grade.map(g => (
                                        <option key={g.id} value={g.id}>{g.nome}</option>
                                    ))}
                                </select>
                                {errProf.turma_disciplina_id && <span className="error-msg">{errProf.turma_disciplina_id.message}</span>}
                            </div>

                            {/* 2. Escolher o Professor */}
                            <div>
                                <label className="label">Professor *</label>
                                <select
                                    {...regProf("professor_id", { required: "Selecione o professor" })}
                                    className="input-base"
                                >
                                    <option value="">Selecione...</option>
                                    {listaProfessores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome_completo}</option>
                                    ))}
                                </select>
                                {errProf.professor_id && <span className="error-msg">{errProf.professor_id.message}</span>}
                            </div>

                            {/* 3. Data de Início */}
                            <div>
                                <label className="label">Data de Início *</label>
                                <input
                                    type="date"
                                    {...regProf("data_inicio", { required: "Data obrigatória" })}
                                    className="input-base"
                                />
                                {errProf.data_inicio && <span className="error-msg">{errProf.data_inicio.message}</span>}
                            </div>

                            <button type="submit" className="btn-primary w-full">Confirmar Alocação</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ESTILOS LOCAIS (Pode mover pro CSS global se quiser) */}
            <style>{`
        .btn-add { background: #ccff00; color: #0f172a; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; transition: all 0.2s; }
        .btn-add:hover { background: #bfff00; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-add:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); }
        .empty-state { text-align: center; padding: 3rem; border: 1px dashed #e5e7eb; border-radius: 0.75rem; color: #9ca3af; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 1rem; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: fadeIn 0.3s ease; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-weight: bold; font-size: 1.125rem; color: #1f2937; }
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input-base { width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; }
        .input-base:focus { border-color: #0f172a; ring: 1px solid #0f172a; }
        .error-msg { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; display: block; }
        .btn-primary { background: #0f172a; color: white; padding: 0.75rem; border-radius: 0.5rem; font-weight: bold; margin-top: 1rem; transition: background 0.2s; }
        .btn-primary:hover { background: #1e293b; }
      `}</style>
        </div>
    );
}