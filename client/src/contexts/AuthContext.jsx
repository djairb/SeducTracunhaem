import React, { createContext, useState, useEffect, useContext } from 'react';


const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // --- FORÇAR LOGIN MOCK (SOLICITAÇÃO DO USUÁRIO) ---
  const [user, setUser] = useState({
    nome: 'Admin Master (Mock)',
    email: 'admin@seduc.mock',
    perfil: 'Master',
    escolaId: 1,
    professorId: 1
  });
  const [loading, setLoading] = useState(false);

  // --- FILTRO GLOBAL DE ESCOLA (SECRETARIA) ---
  const [globalSchoolId, setGlobalSchoolId] = useState(''); // '' = Todas

  // Efeito removido pois já iniciamos logado
  useEffect(() => {
    setLoading(false);
  }, []);

  const signIn = async (email, senha) => {
    // Simula login com sucesso para qualquer entrada
    setUser({
      nome: 'Admin Master (Mock)',
      email: email,
      perfil: 'Master',
      escolaId: 1,
      professorId: 1
    });
    return '/';
  };

  const signOut = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  // --- ALTERNAR PERFIL MOCK (SIMULADOR) ---
  // --- ALTERNAR PERFIL MOCK (SIMULADOR) ---
  const alternarPerfil = (tipo) => {
    let novoUser = {
      ...user,
      nome: 'Admin Master (Mock)',
      perfil: 'Master',
      professorId: null,
      escolaId: null
    };

    if (tipo === 'ProfessorInfantil') {
      novoUser = {
        ...user,
        nome: 'Prof. Ana (Infantil)',
        perfil: 'Professor',
        professorId: 1, // Escola 1
        escolaId: 1
      };
    } else if (tipo === 'ProfessorIniciais') {
      novoUser = {
        ...user,
        nome: 'Prof. Carlos (Iniciais)',
        perfil: 'Professor',
        professorId: 2, // Escola 2
        escolaId: 2
      };
    } else if (tipo === 'ProfessorFinais') {
      novoUser = {
        ...user,
        nome: 'Prof. Beatriz (Finais)',
        perfil: 'Professor',
        professorId: 3, // Escola 3
        escolaId: 3
      };
    }

    setUser(novoUser);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut, alternarPerfil, globalSchoolId, setGlobalSchoolId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}