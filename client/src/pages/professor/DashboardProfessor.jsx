import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, ArrowRight } from 'lucide-react'; // Removi LogOut
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../../infra/apiConfig';

// Removi a importação da Logo daqui, pois já está no App.jsx

export default function DashboardProfessor() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.professorId) {
      carregarMinhasTurmas(user.professorId);
    } else {
      setLoading(false);
    }
  }, [user]);

  const carregarMinhasTurmas = async (idProf) => {
    try {
      const resTurmas = await axios.get(`${API_BASE_URL}/professores/${idProf}/turmas`);
      setTurmas(resTurmas.data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64 text-[#0f0155] gap-2">
            <div className="w-4 h-4 bg-[#bcfe2b] rounded-full animate-bounce"></div>
            Carregando seus diários...
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

        {/* Título da Página (Já que o Header principal fica no topo) */}
        <div className="mb-8 border-b border-gray-200 pb-4">
             <h2 className="text-2xl font-bold text-[#0f0155]">Minhas Turmas Ativas</h2>
             <p className="text-gray-500">Selecione uma disciplina para gerenciar aulas, frequências e conteúdos.</p>
        </div>

        {/* --- LISTAGEM DE TURMAS --- */}
        {turmas.length === 0 ? (
            <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-200 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20 text-[#0f0155]"/>
                <p className="text-lg font-medium text-gray-600">Nenhuma turma encontrada.</p>
                <p className="text-sm mt-2">Você ainda não possui aulas atribuídas.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {turmas.map(t => (
                    <div key={t.alocacao_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
                        
                        {/* Faixa Colorida */}
                        <div className="bg-[#0f0155] h-2 w-full group-hover:bg-[#bcfe2b] transition-colors duration-300"/>
                        
                        <div className="p-6">
                            <span className="text-xs font-bold text-[#0f0155] bg-blue-50 px-2 py-1 rounded uppercase tracking-wide border border-blue-100">
                                {t.codigo}
                            </span>

                            <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2 line-clamp-2 min-h-[3.5rem]" title={t.nome_disciplina}>
                                {t.nome_disciplina}
                            </h3>
                            
                            <p className="text-sm text-gray-500 mb-6 line-clamp-1 border-b border-gray-50 pb-4">
                                {t.nome_curso}
                            </p>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="p-1.5 bg-[#0f0155]/10 rounded-lg text-[#0f0155]">
                                        <Calendar size={16}/>
                                    </div>
                                    <span className="font-medium">{t.periodo} • {t.turno}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="p-1.5 bg-[#0f0155]/10 rounded-lg text-[#0f0155]">
                                        <Users size={16}/>
                                    </div>
                                    <span className="font-medium">{t.total_alunos} alunos matriculados</span>
                                </div>
                            </div>

                            <Link 
                                to={`/professor/diario/${t.alocacao_id}`} 
                                className="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 group-hover:bg-[#0f0155] group-hover:text-white transition-all shadow-sm"
                            >
                                Abrir Diário <ArrowRight size={18} className="text-gray-400 group-hover:text-[#bcfe2b] transition-colors"/>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}