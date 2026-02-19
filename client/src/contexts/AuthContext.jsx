import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DATA } from '../mocks/data';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- ESTADOS GLOBAIS (BANCO DE DADOS LOCAL) ---
  const [escolas, setEscolas] = useState(MOCK_DATA.escolas);
  const [alunos, setAlunos] = useState(MOCK_DATA.alunos);
  const [turmas, setTurmas] = useState(MOCK_DATA.turmas);
  const [professores, setProfessores] = useState(MOCK_DATA.professores);
  const [escolaIdSelecionada, setEscolaIdSelecionada] = useState(null);
  
  // Estados para as novas funcionalidades do Júnior
  const [frequencias, setFrequencias] = useState([]);
  const [planejamentos, setPlanejamentos] = useState([]);
  const [registrosPedagogicos, setRegistrosPedagogicos] = useState([]); // Conquistas e Pareceres
  const [gradeHorarios, setGradeHorarios] = useState([]); // Gestão de horários pela secretaria
  const [diasBloqueados, setDiasBloqueados] = useState([
    { data: '2026-02-17', motivo: 'Carnaval' },
    { data: '2026-02-18', motivo: 'Quarta-feira de Cinzas' }
  ]);

  useEffect(() => {
    const loadStorageData = () => {
      const recoveredUser = localStorage.getItem('@Seduc:user');
      if (recoveredUser) {
        setUser(JSON.parse(recoveredUser));
      }
      setLoading(false);
    };
    loadStorageData();
  }, []);

  // --- LÓGICA DE ESCOLA E FILTROS ---
  const selecionarEscola = (id) => setEscolaIdSelecionada(Number(id));

  const bloquearDia = (data, motivo) => {
    setDiasBloqueados([...diasBloqueados, { data, motivo }]);
  };

  const isDiaBloqueado = (data) => {
    return diasBloqueados.find(d => d.data === data);
  };

  const getTurmasPorEscola = () =>
    escolaIdSelecionada ? turmas.filter(t => t.escola_id === escolaIdSelecionada) : [];

  const getAlunosPorEscola = () => {
    if (['Master', 'Coordenacao', 'Secretaria'].includes(user?.perfil)) {
      return escolaIdSelecionada 
        ? alunos.filter(a => {
            const turma = turmas.find(t => t.id === a.turma_id);
            return turma?.escola_id === escolaIdSelecionada;
          }) 
        : [];
    }
    return alunos;
  };

  const getTurmasVinculadas = () => {
    if (!user) return [];
    if (user.perfil === 'Master') return turmas;
    // Vincula pelo nível de ensino do professor logado
    return turmas.filter(t => t.nivel_ensino === user.nivel_ensino);
  };

  // --- 1. MÓDULO DE PLANEJAMENTO (DINÂMICO PELO PDF) ---
  const salvarPlanejamento = (dados) => {
    const novoPlan = {
      ...dados,
      id: planejamentos.length + 1,
      dataEnvio: new Date().toISOString(),
      status: 'Enviado'
    };
    setPlanejamentos([...planejamentos, novoPlan]);
  };

  const atualizarStatusPlanejamento = (planId, novoStatus, feedback = "") => {
    setPlanejamentos(prev => prev.map(p => 
      p.id === planId ? { ...p, status: novoStatus, feedbackCoordenação: feedback } : p
    ));
  };

  // --- 2. MÓDULO DE FREQUÊNCIA (P, F, J E LOTE) ---
  const salvarPresenca = (data, turmaId, listaPresenca) => {
    const novoRegistro = {
      id: frequencias.length + 1,
      data,
      turmaId,
      presencas: listaPresenca // [{alunoId, status, justificativa}]
    };
    setFrequencias([...frequencias, novoRegistro]);
  };

  const salvarFrequenciaLote = (turmaId, registrosLote) => {
    // Permite salvar vários dias de uma vez (Semanal/Mensal)
    const novosRegistros = registrosLote.map((reg, index) => ({
      id: frequencias.length + index + 1,
      turmaId,
      ...reg
    }));
    setFrequencias(prev => [...prev, ...novosRegistros]);
  };

  // --- 3. MÓDULO PEDAGÓGICO (CONQUISTAS E PARECERES) ---
  const salvarRegistroPedagogico = (dados) => {
    // dados: { alunoId, tipo: 'Conquista' | 'Parecer', periodo, texto }
    const novoRegistro = {
      ...dados,
      id: registrosPedagogicos.length + 1,
      dataLancamento: new Date().toISOString(),
    };
    setRegistrosPedagogicos([...registrosPedagogicos, novoRegistro]);
  };

  const getRegistrosAluno = (alunoId) => {
    return registrosPedagogicos.filter(r => Number(r.alunoId) === Number(alunoId));
  };

  // --- 4. GESTÃO DE SECRETARIA (HORÁRIOS E MATRIZ) ---
  const salvarGradeHoraria = (turmaId, grade) => {
    setGradeHorarios(prev => [
      ...prev.filter(g => g.turmaId !== turmaId), 
      { turmaId, grade }
    ]);
  };

  // --- CRUDS GERAIS ---
  const adicionarProfessor = (novoProf) => {
    const profComId = { 
      ...novoProf, 
      id: professores.length + 1,
      escolas_ids: novoProf.escolas_ids || [] 
    };
    setProfessores([...professores, profComId]);
  };

  const vincularProfessorEscola = (profId, escolaId) => {
    setProfessores(professores.map(p => {
      if (p.id === profId) {
        const novasEscolas = p.escolas_ids.includes(Number(escolaId)) 
          ? p.escolas_ids 
          : [...p.escolas_ids, Number(escolaId)];
        return { ...p, escolas_ids: novasEscolas };
      }
      return p;
    }));
  };

  const desvincularProfessorEscola = (profId, escolaId) => {
    setProfessores(professores.map(p => {
      if (p.id === profId) {
        return { ...p, escolas_ids: p.escolas_ids.filter(id => id !== Number(escolaId)) };
      }
      return p;
    }));
  };

  const adicionarAluno = (novoAluno) => {
    const alunoComId = { ...novoAluno, id: alunos.length + 1, status: 'Ativo' };
    setAlunos([...alunos, alunoComId]);
  };

  const editarAluno = (id, dadosAtualizados) => {
    setAlunos(alunos.map(a => a.id === id ? { ...a, ...dadosAtualizados } : a));
  };

  const excluirAluno = (id) => {
    setAlunos(alunos.filter(a => a.id !== id));
  };

  const adicionarEscola = (dados) => {
    const nova = { ...dados, id: escolas.length + 1, ativo: true };
    setEscolas([...escolas, nova]);
  };

  // --- AUTENTICAÇÃO ---
  const signIn = (perfilId) => {
    let userData = null;
    if (perfilId === 'master') {
      userData = { id: 1, nome: "Junior (Master)", perfil: "Master", perfil_descricao: "Secretaria de Educação" };
    } else {
      const niveis = { infantil: 'Infantil', iniciais: 'Iniciais', finais: 'Finais' };
      userData = { 
        id: 10, 
        nome: `Prof. ${perfilId.toUpperCase()}`, 
        perfil: "Professor", 
        nivel_ensino: niveis[perfilId],
        perfil_descricao: `Docente — ${niveis[perfilId]}` 
      };
    }
    setUser(userData);
    localStorage.setItem('@Seduc:user', JSON.stringify(userData));
    navigate(userData.perfil === 'Professor' ? '/portal-professor' : '/');
  };

  const signOut = () => {
    localStorage.removeItem('@Seduc:user');
    setUser(null);
    setEscolaIdSelecionada(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      signed: !!user, user, loading, signIn, signOut,
      escolas, escolaIdSelecionada, selecionarEscola, adicionarEscola,
      alunos, adicionarAluno, editarAluno, excluirAluno, getAlunosPorEscola,
      turmas, getTurmasPorEscola, getTurmasVinculadas,
      professores, adicionarProfessor, vincularProfessorEscola, desvincularProfessorEscola,
      diasBloqueados, bloquearDia, isDiaBloqueado,
      salvarPlanejamento, planejametos: planejamentos, atualizarStatusPlanejamento,
      salvarPresenca, salvarFrequenciaLote, frequencias,
      salvarRegistroPedagogico, getRegistrosAluno, registrosPedagogicos,
      salvarGradeHoraria, gradeHorarios
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);