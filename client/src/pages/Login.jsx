import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <--- Para redirecionar
import { useAuth } from '../contexts/AuthContext'; // <--- Nosso cérebro
import logoConectiva from '../img/conectiva-logo.jpg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth(); // Pega a função de logar do contexto
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            // Chama o AuthContext. Ele vai bater no back, salvar token e definir o user
            const destino = await signIn(email, senha);
            
            // Se deu certo, o contexto devolve pra onde devemos ir (Admin ou Portal)
            navigate(destino);

        } catch (error) {
            // O Contexto já tratou o erro e devolveu uma mensagem amigável no throw
            setErro(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-conectiva-navy p-4 relative overflow-hidden">

            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-conectiva-lime to-transparent"></div>

            <div className="w-full max-w-[450px] relative z-10">

                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <img
                        src={logoConectiva}
                        alt="Logo Conectiva"
                        className="h-16 w-auto mx-auto mb-4 rounded-xl shadow-lg shadow-black/20"
                    />
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Conectiva<span className="text-conectiva-lime">.</span>
                    </h1>
                    <p className="text-slate-300 mt-2">Sistema de Gestão Acadêmica</p>
                </div>

                {/* Card de Login */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
                        Acesse sua conta
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 hidden">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-conectiva-navy/20 focus:border-conectiva-navy transition outline-none text-gray-700 placeholder-gray-400"
                                    placeholder="Email institucional"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 hidden">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-conectiva-navy/20 focus:border-conectiva-navy transition outline-none text-gray-700 placeholder-gray-400"
                                    placeholder="Sua senha"
                                    required
                                />
                            </div>
                        </div>

                        {erro && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100 font-medium animate-pulse">
                                {erro}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-conectiva-navy text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-conectiva-navy/20 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} /> Validando...
                                </>
                            ) : (
                                <>
                                    Entrar <ArrowRight size={20} className="text-conectiva-lime" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <p className="text-center text-slate-400 text-sm mt-8">
                    © 2026 Connectiva. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}