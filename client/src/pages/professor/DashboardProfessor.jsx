import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_DATA } from '../../mocks/data';
import { BookOpen, Users, ClipboardCheck, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardProfessor = () => {
  const { user, getTurmasVinculadas } = useAuth();
  const turmas = getTurmasVinculadas(); // Busca turmas do nível específico (Infantil, Iniciais ou Finais)

  return (
    <div className="space-y-6">
      {/* Header de Boas-vindas */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase">
            Minhas Turmas <span className="text-primary">- {user?.nivel_ensino}</span>
          </h1>
          <p className="text-slate-500">Selecione uma turma para gerenciar diários e avaliações.</p>
        </div>
      </header>

      {/* Grid de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.map((turma) => (
          <motion.div 
            key={turma.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded mb-2 uppercase">
                {turma.turno}
              </span>
              <h3 className="text-lg font-bold text-slate-800 uppercase leading-tight">
                {turma.nome}
              </h3>
              <p className="text-xs text-slate-500 mt-1 uppercase font-medium">
                {turma.nome_curso}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2"><Users size={16}/> Alunos:</span>
                <span className="font-bold">{turma.total_alunos}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Botão Diário - Link para o diário funcional */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group">
                  <ClipboardCheck className="text-slate-400 group-hover:text-primary mb-1" size={20}/>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Diário</span>
                </button>

                {/* Botão Avaliação - Link para notas/conceitos */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group">
                  <Award className="text-slate-400 group-hover:text-primary mb-1" size={20}/>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Avaliar</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Informativo BNCC Lateral (Opcional) */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-4">
        <div className="p-2 bg-primary rounded-lg text-white">
          <BookOpen size={20}/>
        </div>
        <div>
          <h4 className="text-sm font-bold text-primary uppercase">Lembrete Pedagógico</h4>
          <p className="text-xs text-slate-600 mt-1">
            {user?.nivel_ensino === 'Infantil' 
              ? 'Não esqueça de preencher o registro de vivências e objetivos de aprendizagem mensais.' 
              : 'As notas do 1º bimestre devem ser lançadas conforme o calendário escolar.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfessor;