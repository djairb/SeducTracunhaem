import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileBarChart, 
  Printer, 
  ArrowLeft, 
  Download, 
  Search,
  School
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AtaResultados = () => {
  const { turmas, alunos, frequencias, escolaIdSelecionada, escolas } = useAuth();
  const navigate = useNavigate();
  
  const [turmaId, setTurmaId] = useState('');

  // 1. FILTRAGEM POR ESCOLA (Respeitando o Header)
  const turmasDaEscola = useMemo(() => {
    return turmas.filter(t => Number(t.escola_id) === Number(escolaIdSelecionada));
  }, [turmas, escolaIdSelecionada]);

  const escolaAtual = escolas.find(e => e.id === Number(escolaIdSelecionada));
  const turmaAtual = turmas.find(t => t.id === Number(turmaId));
  const alunosDaTurma = alunos.filter(a => Number(a.turma_id) === Number(turmaId));

  // 2. LÓGICA DE CÁLCULO DE FREQUÊNCIA (Pente Fino do Júnior)
  const calcularPresenca = (alunoId) => {
    const chamadasTurma = frequencias.filter(f => f.turmaId === Number(turmaId));
    if (chamadasTurma.length === 0) return '100%';

    let totalPresencas = 0;
    let totalAulas = chamadasTurma.length;

    chamadasTurma.forEach(chamada => {
      const registro = chamada.presencas.find(p => p.alunoId === alunoId);
      // 'P' ou 'J' (Justificada) contam como presença para fins de estatística
      if (registro?.status === 'P' || registro?.status === 'J') {
        totalPresencas++;
      }
    });

    return ((totalPresencas / totalAulas) * 100).toFixed(0) + '%';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER - OCULTO NA IMPRESSÃO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Ata de Resultados</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
               <School size={10}/> {escolaAtual?.nome || 'Selecione uma Unidade'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="bg-white border-none rounded-xl text-[10px] font-black uppercase p-3 shadow-sm focus:ring-2 focus:ring-primary min-w-[200px]"
          >
            <option value="">Selecionar Turma...</option>
            {turmasDaEscola.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
          
          <button 
            onClick={handlePrint}
            disabled={!turmaId}
            className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Printer size={16} /> Imprimir Ata
          </button>
        </div>
      </div>

      {/* DOCUMENTO DA ATA (FORMATADO PARA IMPRESSÃO) */}
      {turmaId ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0">
          
          {/* CABEÇALHO OFICIAL */}
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Prefeitura Municipal de Tracunhaém</h2>
            <h3 className="text-lg font-black uppercase italic text-slate-800">Secretaria Municipal de Educação</h3>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-4">
              Ata de Resultados Finais - Ano Letivo 2026
            </p>
          </div>

          {/* INFO DA TURMA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-slate-50 rounded-3xl print:bg-white print:border print:border-slate-200">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Unidade Escolar</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase">{escolaAtual?.nome}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Turma</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase">{turmaAtual?.nome}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Turno</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase">{turmaAtual?.turno}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Nível</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase">{turmaAtual?.nivel_ensino}</p>
            </div>
          </div>

          {/* TABELA DE RESULTADOS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-800 text-white print:bg-slate-200 print:text-black">
                  <th className="p-3 text-[9px] font-black uppercase border border-slate-300">Nº</th>
                  <th className="p-3 text-[9px] font-black uppercase border border-slate-300">Nome do Aluno</th>
                  <th className="p-3 text-[9px] font-black uppercase border border-slate-300 text-center">Frequência (%)</th>
                  <th className="p-3 text-[9px] font-black uppercase border border-slate-300 text-center">Resultado Final</th>
                  <th className="p-3 text-[9px] font-black uppercase border border-slate-300">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alunosDaTurma.map((aluno, index) => (
                  <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-[10px] font-bold text-slate-400 border border-slate-200 text-center">{index + 1}</td>
                    <td className="p-3 text-[10px] font-black text-slate-700 uppercase border border-slate-200">{aluno.nome}</td>
                    <td className="p-3 text-[10px] font-bold text-slate-700 border border-slate-200 text-center">
                      {calcularPresenca(aluno.id)}
                    </td>
                    <td className="p-3 text-[10px] font-black text-center border border-slate-200">
                      <span className="text-emerald-600">APROVADO</span>
                    </td>
                    <td className="p-3 text-[9px] text-slate-400 italic border border-slate-200">
                      ---
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ESPAÇO PARA ASSINATURA - APARECE APENAS NA IMPRESSÃO */}
          <div className="hidden print:flex justify-around mt-20 text-center">
            <div className="w-64 border-t border-black pt-2">
              <p className="text-[10px] font-black uppercase">Secretário(a) Escolar</p>
            </div>
            <div className="w-64 border-t border-black pt-2">
              <p className="text-[10px] font-black uppercase">Diretor(a)</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300">
          <FileBarChart size={48} className="mb-2"/>
          <p className="font-black text-[10px] uppercase">Selecione uma turma para gerar a Ata de Resultados</p>
        </div>
      )}
    </div>
  );
};

export default AtaResultados;