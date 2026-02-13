import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DATA } from '../mocks/data'; //

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- ESTADOS GLOBAIS (BANCO DE DADOS LOCAL) ---
  const [escolas, setEscolas] = useState(MOCK_DATA.escolas); //
  const [alunos, setAlunos] = useState(MOCK_DATA.alunos); //
  const [turmas, setTurmas] = useState(MOCK_DATA.turmas); //
  const [professores, setProfessores] = useState(MOCK_DATA.professores);
  const [escolaIdSelecionada, setEscolaIdSelecionada] = useState(null);
  const [frequencias, setFrequencias] = useState([]);
  const [planejamentos, setPlanejamentos] = useState([]);

  // =================================================================
  // 1. EFEITO DE INICIALIZAÇÃO (DESTRAVA A TELA)
  // =================================================================
  useEffect(() => {
    const loadStorageData = () => {
      const recoveredUser = localStorage.getItem('@Seduc:user');
      if (recoveredUser) {
        setUser(JSON.parse(recoveredUser));
      }
      setLoading(false); // Destrava o "Carregando sistema..."
    };
    loadStorageData();
  }, []);

  // =================================================================
  // 2. LOGICA DE SELEÇÃO E FILTRO POR ESCOLA
  // =================================================================
  const selecionarEscola = (id) => setEscolaIdSelecionada(Number(id));

  const [diasBloqueados, setDiasBloqueados] = useState([
  { data: '2026-02-17', motivo: 'Carnaval' },
  { data: '2026-02-18', motivo: 'Quarta-feira de Cinzas' }
]);

const bloquearDia = (data, motivo) => {
  setDiasBloqueados([...diasBloqueados, { data, motivo }]);
};

const isDiaBloqueado = (data) => {
  return diasBloqueados.find(d => d.data === data);
};

  const getTurmasPorEscola = () =>
    escolaIdSelecionada ? turmas.filter(t => t.escola_id === escolaIdSelecionada) : [];

  const getAlunosPorEscola = () => {
  // Se for Master, filtra pela escola selecionada no Header
  if (['Master', 'Coordenacao', 'Secretaria'].includes(user?.perfil)) {
    return escolaIdSelecionada 
      ? alunos.filter(a => {
          const turma = turmas.find(t => t.id === a.turma_id);
          return turma?.escola_id === escolaIdSelecionada;
        }) 
      : [];
  }
  
  // Se for Professor, retorna todos os alunos (o componente FolhaFrequencia filtrará pelo ID da Turma da URL)
  return alunos;
};

  const getTurmasVinculadas = () => {
    if (!user) return [];
    if (user.perfil === 'Master') return turmas;
    return turmas.filter(t => t.nivel_ensino === user.nivel_ensino);
  };

  const salvarPlanejamento = (dados) => {
  const novoPlan = {
    ...dados,
    id: planejamentos.length + 1,
    dataEnvio: new Date().toISOString(),
    status: 'Enviado' // Status inicial para a coordenação ver
  };
  setPlanejamentos([...planejamentos, novoPlan]);
};

  const salvarPresenca = (data, turmaId, listaPresenca) => {
  // listaPresenca virá como [{alunoId: 1, status: 'P'}, {alunoId: 2, status: 'F'}]
  const novoRegistro = {
    id: frequencias.length + 1,
    data,
    turmaId,
    presencas: listaPresenca
  };
  setFrequencias([...frequencias, novoRegistro]);
  console.log("Chamada salva com sucesso!", novoRegistro);
};


  

// 2. Função para Cadastrar Novo Professor (Geral na rede)
const adicionarProfessor = (novoProf) => {
  const profComId = { 
    ...novoProf, 
    id: professores.length + 1,
    escolas_ids: novoProf.escolas_ids || [] // Inicia com vínculo ou vazio
  };
  setProfessores([...professores, profComId]);
};

// 3. Função para Alocar Professor em uma Escola (Vínculo)
const vincularProfessorEscola = (profId, escolaId) => {
  setProfessores(professores.map(p => {
    if (p.id === profId) {
      // Se já não estiver vinculado, adiciona o ID da escola
      const novasEscolas = p.escolas_ids.includes(Number(escolaId)) 
        ? p.escolas_ids 
        : [...p.escolas_ids, Number(escolaId)];
      return { ...p, escolas_ids: novasEscolas };
    }
    return p;
  }));
};

// 4. Função para Remover Vínculo (Desalocar da escola, mas manter no sistema)
const desvincularProfessorEscola = (profId, escolaId) => {
  setProfessores(professores.map(p => {
    if (p.id === profId) {
      return { ...p, escolas_ids: p.escolas_ids.filter(id => id !== Number(escolaId)) };
    }
    return p;
  }));
};

  // =================================================================
  // 3. CRUDS FUNCIONAIS (MEMÓRIA LOCAL)
  // =================================================================
  
  // ALUNOS
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

  // ESCOLAS
  const adicionarEscola = (dados) => {
    const nova = { ...dados, id: escolas.length + 1, ativo: true };
    setEscolas([...escolas, nova]);
  };

  const atualizarStatusPlanejamento = (planId, novoStatus, feedback = "") => {
  setPlanejamentos(prev => prev.map(p => 
    p.id === planId ? { ...p, status: novoStatus, feedbackCoordenação: feedback } : p
  ));
};

  // =================================================================
  // 4. AUTENTICAÇÃO
  // =================================================================
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
      professores, 
    adicionarProfessor, 
    vincularProfessorEscola, 
    desvincularProfessorEscola,
    diasBloqueados, // <--- TEM QUE ESTAR AQUI!
    bloquearDia,
    isDiaBloqueado, salvarPlanejamento, salvarPresenca, atualizarStatusPlanejamento, planejamentos
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);