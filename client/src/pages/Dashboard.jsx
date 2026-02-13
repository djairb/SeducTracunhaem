import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, School, BookOpen, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';

import { useAuth } from '../contexts/AuthContext'; // Importar Contexto

export default function Dashboard() {
    const { globalSchoolId } = useAuth(); // Pegar ID da Escola
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);

    // CORES FIXAS
    const CORES_GENERO = ['#0f172a', '#ec4899', '#94a3b8'];
    const CORES_STATUS = ['#22c55e', '#ef4444', '#f97316']; // Verde, Vermelho, Laranja

    useEffect(() => {
        carregarDados();
    }, [globalSchoolId]); // Recarregar quando mudar a escola

    const carregarDados = async () => {
        setLoading(true); // Mostrar loading ao trocar
        try {
            const dadosMock = await apiService.getDashboardStats(globalSchoolId);
            setDados(dadosMock);
        } catch (error) {
            console.error("Erro dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen gap-2 text-seduc-primary">
            <div className="w-4 h-4 bg-seduc-primary rounded-full animate-bounce"></div>
            Carregando...
        </div>
    );

    const { cards, graficos } = dados;

    // Stats Cards
    const stats = [
        { title: 'Total de Alunos', value: cards.total_alunos, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/alunos' },
        { title: 'Turmas Ativas', value: cards.total_turmas, icon: School, color: 'text-green-600', bg: 'bg-green-50', link: '/turmas' },
        { title: 'Professores', value: cards.total_professores, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', link: '/professores' },
        { title: 'Aulas Dadas', value: cards.total_aulas, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50', link: '#' },
    ];

    return (
        <div className="animate-fadeIn pb-20 p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-seduc-primary">Visão Geral</h1>
                <p className="text-gray-500 mt-1">Métricas da Escola Técnica.</p>
            </div>

            {/* 1. CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Link key={index} to={stat.link !== '#' ? stat.link : '#'} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center ${stat.link !== '#' ? 'hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer' : ''}`}>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* 2. GRÁFICOS NOVOS (Status e Turmas) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* GRÁFICO FREQUÊNCIA GLOBAL */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <PieIcon className="text-gray-400" size={20} />
                        <h3 className="text-lg font-bold text-gray-700">Frequência Global</h3>
                    </div>

                    {/* FORÇANDO ALTURA FIXA (h-64) PARA O GRÁFICO NÃO SUMIR */}
                    <div className="h-64 w-full">
                        {graficos.status && graficos.status.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={graficos.status}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {graficos.status.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_STATUS[index % CORES_STATUS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                                Sem registros de frequência.
                            </div>
                        )}
                    </div>
                </div>

                {/* GRÁFICO TURMAS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-gray-400" size={20} />
                        <h3 className="text-lg font-bold text-gray-700">Comparecimento por Turma (%)</h3>
                    </div>

                    {/* FORÇANDO ALTURA FIXA (h-64) */}
                    <div className="h-64 w-full">
                        {graficos.turmas && graficos.turmas.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={graficos.turmas}
                                    layout="vertical"
                                    margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="percentual" name="Presença (%)" radius={[0, 4, 4, 0]} barSize={24}>
                                        {graficos.turmas.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.percentual < 75 ? '#ef4444' : entry.percentual < 85 ? '#facc15' : '#22c55e'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                                Sem turmas ativas ou dados insuficientes.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. GRÁFICOS ANTIGOS (Demografia) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Perfil: Gênero</h3>
                    <div className="h-64 w-full">
                        {graficos.sexo.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={graficos.sexo} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                        {graficos.sexo.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_GENERO[index % CORES_GENERO.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip /><Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-gray-400">Sem dados.</div>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Perfil: Idade</h3>
                    <div className="h-64 w-full">
                        {graficos.idade.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graficos.idade}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="alunos" name="Qtd Alunos" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-gray-400">Sem dados.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}