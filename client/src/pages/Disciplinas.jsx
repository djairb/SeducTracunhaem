import React, { useEffect, useState } from 'react';
import { Book, Plus, Trash2, Clock, Bookmark } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../infra/apiConfig';

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [novoNome, setNovoNome] = useState('');
  const [novaCarga, setNovaCarga] = useState(60);
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [respDisc, respCursos] = await Promise.all([
        axios.get(`${API_BASE_URL}/disciplinas`),
        axios.get(`${API_BASE_URL}/cursos`)
      ]);
      setDisciplinas(respDisc.data);
      setCursos(respCursos.data);
      // Seleciona o primeiro curso automaticamente se houver
      if (respCursos.data.length > 0) setCursoSelecionado(respCursos.data[0].id);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!novoNome || !cursoSelecionado) return;
    
    setSalvando(true);
    try {
      await axios.post(`${API_BASE_URL}/disciplinas`, {
        curso_id: cursoSelecionado,
        nome: novoNome,
        carga_horaria: novaCarga
      });
      
      // Limpa e recarrega
      setNovoNome('');
      carregarDados(); 
      alert("✅ Disciplina adicionada!");
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Remover esta disciplina do catálogo?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/disciplinas/${id}`);
      setDisciplinas(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao excluir.");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start animate-fadeIn">
      
      {/* --- FORMULÁRIO DE CADASTRO RÁPIDO (LADO ESQUERDO) --- */}
      <div className="w-full xl:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Book size={24} />
            </div>
            <div>
                <h2 className="font-bold text-gray-800">Nova Disciplina</h2>
                <p className="text-xs text-gray-500">Adicione ao catálogo.</p>
            </div>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curso Vinculado</label>
                <select 
                    value={cursoSelecionado}
                    onChange={(e) => setCursoSelecionado(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-gray-50 outline-none focus:border-orange-400"
                >
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria</label>
                <input 
                    type="text" 
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Anatomia Humana"
                    className="w-full p-2 border rounded-lg outline-none focus:border-orange-400"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária (horas)</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={novaCarga}
                        onChange={(e) => setNovaCarga(e.target.value)}
                        className="w-24 p-2 border rounded-lg outline-none focus:border-orange-400"
                    />
                    <span className="text-sm text-gray-500">horas/aula</span>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={salvando}
                className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 flex justify-center gap-2 items-center mt-4"
            >
                {salvando ? 'Salvando...' : <><Plus size={20} /> Adicionar</>}
            </button>
        </form>
      </div>

      {/* --- LISTAGEM (LADO DIREITO) --- */}
      <div className="w-full xl:w-2/3">
        <h1 className="text-2xl font-bold text-conectiva-navy mb-6">Catálogo de Disciplinas</h1>
        
        {loading ? (
            <p className="text-gray-500">Carregando...</p>
        ) : disciplinas.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-dashed text-center text-gray-400">
                <Book size={48} className="mx-auto mb-3 opacity-20" />
                <p>Nenhuma disciplina cadastrada ainda.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disciplinas.map((disc) => (
                    <div key={disc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:shadow-md transition">
                        <div>
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Bookmark size={16} className="text-orange-500" />
                                {disc.nome}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                                    <Clock size={12} /> {disc.carga_horaria}h
                                </span>
                                <span>{disc.nome_curso}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleExcluir(disc.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                            title="Excluir"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}