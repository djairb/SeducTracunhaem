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
  const [escolaIdSelecionada, setEscolaIdSelecionada] = useState(null);

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

  const getTurmasPorEscola = () =>
    escolaIdSelecionada ? turmas.filter(t => t.escola_id === escolaIdSelecionada) : [];

  const getAlunosPorEscola = () =>
    escolaIdSelecionada ? alunos.filter(a => {
      const turma = turmas.find(t => t.id === a.turma_id);
      return turma?.escola_id === escolaIdSelecionada;
    }) : [];

  const getTurmasVinculadas = () => {
    if (!user) return [];
    if (user.perfil === 'Master') return turmas;
    return turmas.filter(t => t.nivel_ensino === user.nivel_ensino);
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
      turmas, getTurmasPorEscola, getTurmasVinculadas
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);