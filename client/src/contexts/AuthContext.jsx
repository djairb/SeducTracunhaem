import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../infra/apiConfig';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao iniciar, verifica se tem token salvo no navegador
    const dadosSalvos = localStorage.getItem('@EscolaTecnica:user');
    const tokenSalvo = localStorage.getItem('@EscolaTecnica:token');

    if (dadosSalvos && tokenSalvo) {
      setUser(JSON.parse(dadosSalvos));
      // Configura o axios pra sempre mandar o token nas requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
    }
    setLoading(false);
  }, []);

  const signIn = async (email, senha) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, senha }, { withCredentials: true });
      
      const { token, user, redirectPath } = response.data;

      // Salva no navegador pra não deslogar se der F5
      localStorage.setItem('@EscolaTecnica:user', JSON.stringify(user));
      localStorage.setItem('@EscolaTecnica:token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return redirectPath; // Retorna pra onde ele deve ir
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao logar');
    }
  };

  const signOut = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}