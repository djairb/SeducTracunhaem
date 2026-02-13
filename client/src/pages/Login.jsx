import React from 'react';

import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Baby, 
  BookOpen, 
  GraduationCap, 
  ArrowRight 
} from 'lucide-react';
import logo from '../img/seduc-logo2.jpg';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onLogin }) => {

    const { signIn } = useAuth();
  const perfis = [
    { 
      id: 'master', 
      label: 'Secretaria (Master)', 
      icon: <ShieldCheck className="w-8 h-8" />, 
      desc: 'Gestão de rede, escolas e matrículas',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    { 
      id: 'infantil', 
      label: 'Educação Infantil', 
      icon: <Baby className="w-8 h-8" />, 
      desc: 'Creches e Pré-escola (Campos de Experiência)', // [cite: 9, 11]
      color: 'bg-orange-50 text-orange-600 border-orange-100'
    },
    { 
      id: 'iniciais', 
      label: 'Anos Iniciais', 
      icon: <BookOpen className="w-8 h-8" />, 
      desc: '1º ao 5º ano (Foco em Alfabetização)', // [cite: 15, 18]
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    { 
      id: 'finais', 
      label: 'Anos Finais', 
      icon: <GraduationCap className="w-8 h-8" />, 
      desc: '6º ao 9º ano (Disciplinas Específicas)', // [cite: 23, 27]
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Header com Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <img 
          src={logo} 
          alt="Seduc Tracunhaém" 
          className="w-48 h-auto mx-auto mb-4 drop-shadow-sm rounded-xl"
        />
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Seduc <span className="text-primary">Tracunhaém</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Portal de Gestão Acadêmica</p>
      </motion.div>

      {/* Grid de Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
        {perfis.map((perfil, index) => (
          <motion.button
            key={perfil.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn(perfil.id)}
            className="group relative p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition-all duration-300 text-left flex items-center"
          >
            <div className={`p-4 rounded-xl mr-5 transition-colors ${perfil.color} group-hover:bg-primary group-hover:text-white`}>
              {perfil.icon}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary">
                {perfil.label}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {perfil.desc}
              </p>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>

      {/* Footer Informativo */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-col items-center space-y-2"
      >
        <div className="h-1 w-12 bg-primary rounded-full mb-2"></div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
          Ambiente de Homologação Pedagógica 2026
        </p>
      </motion.div>
    </div>
  );
};

export default Login;