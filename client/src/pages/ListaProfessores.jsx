import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, User, Phone, Briefcase, FileText, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../infra/apiConfig';

export default function ListaProfessores() {
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9;

  // Modal Deletar
  const [profParaDeletar, setProfParaDeletar] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarProfessores();
  }, []);

  const carregarProfessores = async () => {
    try {
    const { data } = await axios.get(`${API_BASE_URL}/professores`);
      setProfessores(data);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!profParaDeletar) return;
    setExcluindo(true);
    try {
      await axios.delete(`${API_BASE_URL}/professores/${profParaDeletar.id}`);
      setProfessores(prev => prev.filter(p => p.id !== profParaDeletar.id));
      setProfParaDeletar(null);
      alert("✅ Professor excluído com sucesso.");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao excluir.";
      alert(`❌ ${msg}`);
    } finally {
      setExcluindo(false);
    }
  };

  // Filtro
  const filtrados = professores.filter(p => 
    p.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf.includes(busca)
  );

  // Paginação Lógica
  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const exibidos = filtrados.slice(inicio, inicio + itensPorPagina);

  return (
    <div>
      {/* --- MODAL --- */}
      {profParaDeletar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertTriangle size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Demitir Professor?</h3>
            <p className="text-center text-gray-500 mb-6">
              Você vai remover <strong>{profParaDeletar.nome_completo}</strong>.<br/>
              <span className="text-red-500 font-bold text-xs uppercase mt-2 block">Cuidado: O histórico pode ser perdido.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setProfParaDeletar(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={confirmarExclusao} disabled={excluindo} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
                {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-conectiva-navy">Corpo Docente</h1>
          <p className="text-gray-500">Gestão dos Professores ({professores.length} ativos).</p>
        </div>
        <Link to="/professores/novo" className="bg-conectiva-navy text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-slate-800 shadow-lg shadow-conectiva-navy/20">
          <UserPlus size={20} /> Novo Professor
        </Link>
      </div>

      {/* --- BUSCA --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" placeholder="Busque por nome ou CPF..." 
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          value={busca} onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
        />
      </div>

      {/* --- GRID --- */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Carregando professores...</div>
      ) : exibidos.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <Briefcase size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum professor encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {exibidos.map((prof) => (
            <div key={prof.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group relative flex flex-col justify-between">
              
              {/* Ações */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Link to={`/professores/editar/${prof.id}`} className="p-2 bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full border border-gray-100 shadow-sm"><Edit2 size={16} /></Link>
                <button onClick={() => setProfParaDeletar(prof)} className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-100 shadow-sm"><Trash2 size={16} /></button>
              </div>

              <div>
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
                        {prof.nome_completo.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 line-clamp-1" title={prof.nome_completo}>{prof.nome_completo}</h3>
                        {console.log(prof)}
                        <span className="text-xs text-gray-400 font-medium">Contratado em {prof.data_contratacao ? new Date(prof.data_contratacao).toLocaleDateString('pt-BR') : '-'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 col-span-2" title="Registro Profissional">
                        <FileText size={14} className="text-purple-600" />
                        <span className="font-bold text-gray-700">{prof.conselho_tipo}: {prof.conselho_numero}/{prof.conselho_uf}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2"><User size={14} className="text-purple-600" /><span>CPF: {prof.cpf}</span></div>
                    <div className="flex items-center gap-2 col-span-2"><Phone size={14} className="text-purple-600" /><span>{prof.telefone_celular}</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${prof.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    ● {prof.ativo ? 'Ativo' : 'Inativo'}
                 </span>
                 <span className="text-xs text-gray-400">Docente</span>
              </div>
            </div>
          ))}
        </div>
      )}

       {/* PAGINAÇÃO SIMPLES */}
       {filtrados.length > itensPorPagina && (
        <div className="flex justify-center gap-4 pb-8">
            <button onClick={() => setPaginaAtual(p => Math.max(p-1, 1))} disabled={paginaAtual===1} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={20}/></button>
            <span className="self-center text-sm text-gray-500">Pág {paginaAtual} de {totalPaginas}</span>
            <button onClick={() => setPaginaAtual(p => Math.min(p+1, totalPaginas))} disabled={paginaAtual===totalPaginas} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={20}/></button>
        </div>
      )}
    </div>
  );
}