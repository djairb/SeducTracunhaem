import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_DATA } from '../../mocks/data';
import { Award, UserCircle, Save, AlertCircle } from 'lucide-react';

const AvaliacaoAluno = () => {
  const { user } = useAuth();
  const nivel = user?.nivel_ensino; //
  
  // Simulando a seleção de uma turma e disciplina do mock
  const alunosDaTurma = MOCK_DATA.alunos.filter(a => a.id <= 10); // Pega os 10 primeiros para o exemplo
  const disciplinas = MOCK_DATA.disciplinasPadrao.filter(d => d.nivel === nivel);

  const [periodo, setPeriodo] = useState('1_Bimestre');

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
            <Award className="text-primary" /> Lançamento de Desempenho
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {nivel} • Turma: {MOCK_DATA.turmas[0].nome}
          </p>
        </div>

        <div className="flex gap-2">
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="border-slate-200 rounded-lg text-xs font-bold uppercase focus:ring-primary"
          >
            {/* Períodos ajustados conforme o PDF de acessos [cite: 13, 14, 18] */}
            {nivel === 'Infantil' ? (
              <>
                <option value="1_Semestre">1º Semestre</option>
                <option value="2_Semestre">2º Semestre</option>
                <option value="Final">Parecer Final</option>
              </>
            ) : (
              <>
                <option value="1_Bimestre">1º Bimestre</option>
                <option value="2_Bimestre">2º Bimestre</option>
                <option value="3_Bimestre">3º Bimestre</option>
                <option value="4_Bimestre">4º Bimestre</option>
                <option value="Recuperacao">Recuperação</option>
              </>
            )}
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-primary-dark transition">
            <Save size={16} /> Salvar Tudo
          </button>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">Estudante</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">
                {nivel === 'Infantil' ? 'Parecer / Conquista' : 'Avaliação'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {alunosDaTurma.map((aluno) => (
              <tr key={aluno.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCircle className="text-slate-300" size={32} />
                    <div>
                      <p className="text-sm font-bold text-slate-700 uppercase">{aluno.nome}</p>
                      <p className="text-[10px] text-slate-400 font-medium">MATRÍCULA: 202600{aluno.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {/* Lógica de inputs baseada no nível do professor [cite: 12, 13, 14, 22, 27] */}
                  {nivel === 'Infantil' ? (
                    <div className="space-y-2">
                      <select className="w-full md:w-48 border-orange-100 bg-orange-50/30 rounded-lg text-xs font-bold text-orange-700 p-2">
                        <option>Desenvolvimento Pleno</option>
                        <option>Em Processo</option>
                        <option>Necessita Apoio</option>
                      </select>
                      <textarea 
                        className="w-full border-slate-200 rounded-xl p-3 text-xs min-h-[60px]" 
                        placeholder="Descreva o processo de conquista mensal do aluno..."
                      />
                    </div>
                  ) : nivel === 'Iniciais' ? (
                    <div className="flex flex-col md:flex-row gap-3">
                       <input 
                        type="number" 
                        placeholder="Nota"
                        className="w-20 border-emerald-100 bg-emerald-50/30 rounded-lg text-center font-bold text-emerald-700"
                      />
                      <input 
                        type="text" 
                        placeholder="Aspectos Atitudinais..."
                        className="flex-1 border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ) : (
                    /* Anos Finais - Foco em Notas Numéricas [cite: 27] */
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Nota Bimestral</span>
                        <input 
                          type="number" 
                          max="10" 
                          min="0"
                          className="w-24 border-purple-100 bg-purple-50/30 rounded-lg text-lg text-center font-bold text-purple-700"
                        />
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerta de Prazo */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="text-amber-500" />
        <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
          O sistema fechará para edições deste período em 15 dias. <br/>
          Certifique-se de salvar os registros antes do bloqueio da secretaria.
        </p>
      </div>
    </div>
  );
};

export default AvaliacaoAluno;