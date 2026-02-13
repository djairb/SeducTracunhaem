import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CadastroAluno = () => {
  const { register, handleSubmit } = useForm();
  const { adicionarAluno, turmas } = useAuth();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    adicionarAluno(data); // Salva no "banco" local
    alert("Aluno cadastrado com sucesso!");
    navigate('/alunos'); // Volta para a listagem
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm max-w-2xl mx-auto border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6 uppercase">Novo Aluno</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
          <input {...register("nome")} className="w-full border-slate-200 rounded-lg p-2" required />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Turma</label>
          <select {...register("turma_id")} className="w-full border-slate-200 rounded-lg p-2">
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark">
          Finalizar Cadastro
        </button>
      </form>
    </div>
  );
};

export default CadastroAluno;