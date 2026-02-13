import React from 'react';
import { Link } from 'react-router-dom';
import { FileStack, Users, ClipboardCheck, ArrowRight, BarChart3 } from 'lucide-react';

const RelatoriosHome = () => {
  const cards = [
    {
      title: "Ata de Resultados",
      desc: "Consolidado final de notas e faltas da turma.",
      path: "/relatorios/ata-resultados",
      icon: <FileStack size={32} />,
      color: "bg-blue-500",
      lightColor: "bg-blue-50"
    },
    {
      title: "Frequência Mensal",
      desc: "Relatório detalhado de assiduidade dos alunos.",
      path: "#",
      icon: <Users size={32} />,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50"
    },
    {
      title: "Fichas Pedagógicas",
      desc: "Pareceres descritivos da Educação Infantil.",
      path: "#",
      icon: <ClipboardCheck size={32} />,
      color: "bg-amber-500",
      lightColor: "bg-amber-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Portal de Relatórios</h1>
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Documentação Oficial da Rede Municipal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link 
            key={idx} 
            to={card.path}
            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-16 h-16 ${card.lightColor} rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <div className={`${card.color} text-white p-3 rounded-2xl`}>
                {card.icon}
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">{card.title}</h3>
            <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
              {card.desc}
            </p>

            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
              Acessar Módulo <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Widget de Estatística Rápida */}
      <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <h4 className="text-lg font-black uppercase italic leading-none mb-2 text-emerald-400">Dados Consolidados</h4>
          <p className="text-xs font-bold text-slate-300 uppercase max-w-sm">
            O sistema processou automaticamente as informações de 100% das turmas da rede no último bimestre.
          </p>
        </div>
        <BarChart3 size={120} className="absolute -right-4 -bottom-4 text-white/5" />
        <button className="z-10 bg-white text-slate-800 px-8 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-400 hover:text-white transition-all">
          Sincronizar Dados
        </button>
      </div>
    </div>
  );
};

export default RelatoriosHome;