import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, User, Phone, Calendar, Fingerprint, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Importar Contexto

export default function ListaAlunos() {
  const { globalSchoolId } = useAuth(); // Pegar ID da Escola
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  // Controle de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9;

  // CONTROLE DO MODAL DE EXCLUSÃO
  const [alunoParaDeletar, setAlunoParaDeletar] = useState(null); // Se tiver aluno aqui, abre o modal
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarAlunos();
  }, [globalSchoolId]); // Recarregar quando mudar a escola

  const carregarAlunos = async () => {
    setLoading(true); // Mostrar loading ao trocar
    try {
      const data = await apiService.getAlunos(null, globalSchoolId); // Filtro global
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO DELETAR ---
  const confirmarExclusao = async () => {
    if (!alunoParaDeletar) return;
    setExcluindo(true);
    try {
      // await axios.delete(`${API_BASE_URL}/alunos/${alunoParaDeletar.id}`);
      // Simulação de delete (apenas visual no mock)

      // Remove da lista visualmente sem precisar recarregar tudo
      setAlunos(prev => prev.filter(aluno => aluno.id !== alunoParaDeletar.id));
      setAlunoParaDeletar(null); // Fecha modal
      alert("✅ Registro excluído com sucesso.");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao excluir.";
      alert(`❌ ${msg}`);
    } finally {
      setExcluindo(false);
    }
  };

  // --- UTILS ---
  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '-';
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const formatarCPF = (cpf) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  // --- FILTROS ---
  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.cpf.includes(busca)
  );

  const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const alunosExibidos = alunosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  return (
    <div>
      {/* --- MODAL DE CONFIRMAÇÃO (Só aparece se alunoParaDeletar existir) --- */}
      {alunoParaDeletar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertTriangle size={32} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Excluir Aluno?</h3>
            <p className="text-center text-gray-500 mb-6">
              Você está prestes a remover <strong>{alunoParaDeletar.nome_completo}</strong> e todos os seus dados pessoais do sistema. <br />
              <span className="text-red-500 font-bold text-xs uppercase mt-2 block">Essa ação não pode ser desfeita.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setAlunoParaDeletar(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-600/20 flex justify-center gap-2"
                disabled={excluindo}
              >
                {excluindo ? 'Excluindo...' : (
                  <>
                    <Trash2 size={20} /> Sim, Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CABEÇALHO --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-seduc-primary">Alunos Matriculados</h1>
          <p className="text-gray-500">Gerencie o corpo discente ({alunos.length} total).</p>
        </div>

        <Link
          to="/alunos/novo"
          className="bg-seduc-primary text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-white hover:text-seduc-primary border border-transparent hover:border-seduc-primary transition shadow-lg shadow-seduc-primary/20"
        >
          <UserPlus size={20} />
          Nova Matrícula
        </Link>
      </div>

      {/* --- BUSCA --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Busque por nome ou CPF..."
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
        />
        <span className="text-xs text-gray-400 font-medium px-2 border-l">
          {alunosExibidos.length} de {alunosFiltrados.length}
        </span>
      </div>

      {/* --- GRID --- */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Carregando alunos...</div>
      ) : alunosExibidos.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <User size={48} className="mx-auto mb-3 opacity-20" />
          <p>Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {alunosExibidos.map((aluno) => (
            <div key={aluno.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group relative flex flex-col justify-between">

              {/* BOTÕES DE AÇÃO */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Link
                  to={`/alunos/editar/${aluno.id}`}
                  className="p-2 bg-white text-gray-400 hover:text-seduc-primary hover:bg-green-50 rounded-full transition border border-gray-100 shadow-sm"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => setAlunoParaDeletar(aluno)} // <--- AQUI ABRE O MODAL
                  className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition border border-gray-100 shadow-sm"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-seduc-primary text-seduc-secondary flex items-center justify-center font-bold text-lg shrink-0">
                    {aluno.nome_completo.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-1 leading-tight" title={aluno.nome_completo}>
                      {aluno.nome_completo}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">Matrícula: {aluno.matricula}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2"><User size={14} className="text-seduc-primary" /><span className="capitalize">{aluno.sexo}</span></div>
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-seduc-primary" /><span>{calcularIdade(aluno.data_nascimento)} anos</span></div>
                  <div className="flex items-center gap-2 col-span-2"><Fingerprint size={14} className="text-seduc-primary" /><span className="font-mono text-xs">{formatarCPF(aluno.cpf)}</span></div>
                  <div className="flex items-center gap-2 col-span-2"><Phone size={14} className="text-seduc-primary" /><span>{aluno.telefone_celular}</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${aluno.status_financeiro === 'Em dia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  ● {aluno.status_financeiro}
                </span>
                {/* <span className="text-xs text-gray-400">Téc. Enfermagem</span> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PAGINAÇÃO --- */}
      {alunosFiltrados.length > itensPorPagina && (
        <div className="flex justify-center items-center gap-4 mt-4 pb-8">
          <button
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-600">Página {paginaAtual} de {totalPaginas}</span>
          <button
            onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}