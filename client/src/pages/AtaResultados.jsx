import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileSpreadsheet, Download, TrendingUp, AlertTriangle, X, Printer } from 'lucide-react';

const AtaResultados = () => {
    const { escolaIdSelecionada, turmas, getAlunosPorEscola } = useAuth();
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);

    const turmasDaEscola = turmas.filter(t => t.escola_id === Number(escolaIdSelecionada));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Ata de Resultados</h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Consolidado de Desempenho por Unidade</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {turmasDaEscola.map(turma => {
                    const alunos = getAlunosPorEscola().filter(a => Number(a.turma_id) === Number(turma.id));

                    return (
                        <div key={turma.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg">
                                        {turma.nivel_ensino}
                                    </span>
                                    <TrendingUp size={18} className="text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 uppercase leading-tight mb-1">{turma.nome}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{alunos.length} Alunos Matriculados</p>
                            </div>

                            <button
                                onClick={() => setTurmaSelecionada(turma)}
                                className="mt-6 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase group-hover:bg-slate-800 group-hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <FileSpreadsheet size={16} /> Gerar Ata de Resultados
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* MODAL DA ATA (O QUE DEVE SER EXIBIDO) */}
            {turmaSelecionada && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Ata de Resultados Finais</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{turmaSelecionada.nome} • ANO LETIVO 2026</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-colors">
                                    <Printer size={20} />
                                </button>
                                <button
                                    onClick={() => setTurmaSelecionada(null)}
                                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudante</th>
                                        <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Média Final</th>
                                        <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faltas</th>
                                        <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Situação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {getAlunosPorEscola()
                                        .filter(a => Number(a.turma_id) === Number(turmaSelecionada.id))
                                        .map(aluno => (
                                            <tr key={aluno.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-4 font-bold text-slate-700 text-xs uppercase">{aluno.nome}</td>
                                                <td className="py-4 text-center font-black text-slate-600">
                                                    {/* Gera uma média aleatória entre 6.0 e 9.8 */}
                                                    {(Math.random() * (9.8 - 6.0) + 6.0).toFixed(1)}
                                                </td>
                                                <td className="py-4 text-center font-black text-slate-600">
                                                    {/* Gera faltas aleatórias entre 0 e 12 */}
                                                    {Math.floor(Math.random() * 12)}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-lg">Aprovado</span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase max-w-xs leading-relaxed">
                                Documento gerado eletronicamente pelo sistema de gestão municipal - SEDUC.
                            </p>
                            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
                                <Download size={16} /> Baixar PDF Oficial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtaResultados;