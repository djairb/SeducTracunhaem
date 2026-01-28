import React, { useState, useEffect } from 'react';
import { User, MapPin, FileText, CheckCircle, ArrowRight, ArrowLeft, Search, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../infra/apiConfig';

export default function CadastroAluno() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [step, setStep] = useState(1);
    const [loadingCep, setLoadingCep] = useState(false);
    const [saving, setSaving] = useState(false);

    const { 
        register, 
        handleSubmit, 
        setValue, 
        watch, 
        trigger, 
        reset, 
        formState: { errors, isValid: formIsValid } 
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const cepDigitado = watch('cep');

    // --- CARREGAR DADOS NA EDIÇÃO ---
    useEffect(() => {
        if (isEditMode) {
            axios.get(`${API_BASE_URL}/alunos/${id}`,)
                .then(response => {
                    const dados = response.data;
                    if (dados.data_nascimento) {
                        dados.data_nascimento = dados.data_nascimento.split('T')[0];
                    }
                    reset(dados);
                })
                .catch(err => alert("Erro ao carregar aluno."));
        }
    }, [id, isEditMode, reset]);

    const formatarData = (data) => {
        if (!data) return '-';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const capitalizar = (texto) => {
        if (!texto) return '-';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    const UFS = [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
        "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
        "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ];

    // --- MÁSCARAS ---
    const mascaraCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    const mascaraTelefone = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
    const mascaraCEP = (value) => value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
    const mascaraRG = (value) => value.replace(/\D/g, '').slice(0, 12);

    const handleNextStep = async () => {
        let campos = [];
        if (step === 1) campos = ['nome_completo', 'sexo', 'data_nascimento', 'escolaridade', 'telefone_celular'];
        if (step === 2) campos = ['cpf', 'rg', 'rg_orgao', 'rg_uf', 'nome_mae'];
        if (step === 3) campos = ['numero', 'endereco', 'bairro', 'cidade', 'estado'];

        const isValid = await trigger(campos, { shouldFocus: true });
        
        if (isValid) {
            setStep(prev => prev + 1);
        }
    };

    const buscarCep = async () => {
        const cep = cepDigitado?.replace(/\D/g, '');
        if (cep?.length === 8) {
            setLoadingCep(true);
            try {
                const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!data.erro) {
                    setValue('endereco', data.logradouro);
                    setValue('bairro', data.bairro);
                    setValue('cidade', data.localidade);
                    setValue('estado', data.uf);
                    document.getElementById('numero').focus();
                } else {
                    alert("CEP não encontrado.");
                }
            } catch (error) {
                alert("Erro na busca.");
            } finally {
                setLoadingCep(false);
            }
        }
    };

    // --- ENVIO (CREATE OU UPDATE) ---
    const onSubmit = async (data) => {
        if (step !== 4) return;

        setSaving(true);
        try {
            const dadosLimpos = {
                ...data,
                cpf: data.cpf.replace(/\D/g, ''),
                cep: data.cep.replace(/\D/g, ''),
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/alunos/${id}`, dadosLimpos);
                alert("✅ Dados atualizados com sucesso!");
            } else {
                const response = await axios.post(`${API_BASE_URL}/alunos`, dadosLimpos);
                alert(`✅ Matrícula realizada! Número: ${response.data.matricula}`);
            }

            navigate('/alunos');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || "Erro ao salvar.";
            alert(`❌ ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center mb-6 px-2">
            {[
                { num: 1, icon: User, label: "Pessoal" },
                { num: 2, icon: FileText, label: "Docs" },
                { num: 3, icon: MapPin, label: "Endereço" },
                { num: 4, icon: CheckCircle, label: "Revisão" }
            ].map((s, index) => (
                <div key={s.num} className="flex items-center">
                    <div className={`flex flex-col items-center relative z-10 ${step >= s.num ? 'text-conectiva-navy' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${step >= s.num ? 'bg-conectiva-lime border-conectiva-lime text-conectiva-navy' : 'bg-white border-gray-200'
                            }`}>
                            {step > s.num ? <CheckCircle size={16} className="sm:size-[20px]" /> : <s.icon size={14} className="sm:size-[18px]" />}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold mt-1 sm:mt-2 uppercase tracking-wide text-center px-1">{s.label}</span>
                    </div>
                    {index < 3 && <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 -mt-4 sm:-mt-6 transition-all duration-500 ${step > s.num ? 'bg-conectiva-lime' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:max-w-6xl lg:mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-conectiva-navy">
                        {isEditMode ? 'Editar Aluno' : 'Nova Matrícula'}
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {isEditMode ? 'Atualize os dados cadastrais.' : 'Preencha os passos abaixo.'}
                    </p>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Passo {step} de 4</span>
            </div>

            <StepIndicator />

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* PASSO 1 */}
                {step === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Dados Pessoais</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="sm:col-span-2">
                                <label className="label">Nome Completo *</label>
                                <input 
                                    {...register("nome_completo", { 
                                        required: "Nome completo é obrigatório",
                                        minLength: {
                                            value: 3,
                                            message: "Nome deve ter pelo menos 3 caracteres"
                                        }
                                    })} 
                                    className={`input-base ${errors.nome_completo ? 'input-error' : ''}`}
                                />
                                {errors.nome_completo && (
                                    <span className="error">{errors.nome_completo.message}</span>
                                )}
                            </div>
                            
                            <div>
                                <label className="label">Nome Social</label>
                                <input {...register("nome_social")} className="input-base" />
                            </div>
                            
                            <div>
                                <label className="label">Sexo *</label>
                                <select 
                                    {...register("sexo", { 
                                        required: "Selecione o sexo" 
                                    })} 
                                    className={`input-base ${errors.sexo ? 'input-error' : ''}`}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                                {errors.sexo && (
                                    <span className="error">{errors.sexo.message}</span>
                                )}
                            </div>
                            
                            <div>
  <label className="label">Data de Nascimento *</label>
  <input 
    type="date" 
    {...register("data_nascimento", { 
      required: "Data de nascimento é obrigatória",
      validate: {
        dataFutura: (value) => {
          if (!value) return true;
          const dataNascimento = new Date(value);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0); // Remove horas/minutos/segundos para comparar apenas a data
          return dataNascimento <= hoje || "Data não pode ser futura";
        },
        idadeMinima: (value) => {
          if (!value) return true;
          const dataNascimento = new Date(value);
          const hoje = new Date();
          let idade = hoje.getFullYear() - dataNascimento.getFullYear();
          const mes = hoje.getMonth() - dataNascimento.getMonth();
          if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
          }
          return idade >= 0 || "Data inválida";
        }
      }
    })} 
    className={`input-base ${errors.data_nascimento ? 'input-error' : ''}`}
    max={new Date().toISOString().split('T')[0]} // Adiciona limite máximo no HTML também
  />
  {errors.data_nascimento && (
    <span className="error">{errors.data_nascimento.message}</span>
  )}
</div>
                            
                            <div>
                                <label className="label">Celular *</label>
                                <input
                                    {...register("telefone_celular", { 
                                        required: "Celular é obrigatório",
                                        pattern: {
                                            value: /^\(\d{2}\) \d{5}-\d{4}$/,
                                            message: "Formato inválido. Use (00) 00000-0000"
                                        },
                                        minLength: {
                                            value: 14,
                                            message: "Número incompleto"
                                        }
                                    })}
                                    className={`input-base ${errors.telefone_celular ? 'input-error' : ''}`}
                                    onChange={(e) => setValue("telefone_celular", mascaraTelefone(e.target.value))}
                                />
                                {errors.telefone_celular && (
                                    <span className="error">{errors.telefone_celular.message}</span>
                                )}
                            </div>
                            
                            <div>
                                <label className="label">Escolaridade *</label>
                                <select
                                    {...register("escolaridade", { 
                                        required: "Escolaridade é obrigatória" 
                                    })}
                                    className={`input-base ${errors.escolaridade ? 'input-error' : ''}`}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Fundamental Incompleto">Ensino Fundamental Incompleto</option>
                                    <option value="Fundamental Completo">Ensino Fundamental Completo</option>
                                    <option value="Médio Incompleto">Ensino Médio Incompleto</option>
                                    <option value="Médio Completo">Ensino Médio Completo</option>
                                    <option value="Superior Incompleto">Ensino Superior Incompleto</option>
                                    <option value="Superior Completo">Ensino Superior Completo</option>
                                    <option value="Pós-Graduação">Pós-Graduação</option>
                                </select>
                                {errors.escolaridade && (
                                    <span className="error">{errors.escolaridade.message}</span>
                                )}
                            </div>
                            
                            <div className="sm:col-span-2">
                                <label className="label">Email</label>
                                <input 
                                    type="email" 
                                    {...register("email", {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email inválido"
                                        }
                                    })} 
                                    className={`input-base ${errors.email ? 'input-error' : ''}`}
                                />
                                {errors.email && (
                                    <span className="error">{errors.email.message}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* PASSO 2 */}
                {step === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Documentação</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="label">CPF *</label>
                                <input
                                    {...register("cpf", { 
                                        required: "CPF é obrigatório",
                                        pattern: {
                                            value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                                            message: "CPF inválido"
                                        }
                                    })}
                                    className={`input-base ${errors.cpf ? 'input-error' : ''}`}
                                    onChange={(e) => setValue("cpf", mascaraCPF(e.target.value))}
                                />
                                {errors.cpf && (
                                    <span className="error">{errors.cpf.message}</span>
                                )}
                            </div>
                            
                            <div>
                                <label className="label">RG *</label>
                                <input 
                                    {...register("rg", { 
                                        required: "RG é obrigatório",
                                        minLength: {
                                            value: 5,
                                            message: "RG deve ter pelo menos 5 dígitos"
                                        }
                                    })} 
                                    className={`input-base ${errors.rg ? 'input-error' : ''}`} 
                                    onChange={(e) => setValue("rg", mascaraRG(e.target.value))} 
                                />
                                {errors.rg && (
                                    <span className="error">{errors.rg.message}</span>
                                )}
                            </div>
                            
                            <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2 sm:gap-3">
                                <div>
                                    <label className="label">Órgão *</label>
                                    <input 
                                        {...register("rg_orgao", { 
                                            required: "Órgão emissor é obrigatório" 
                                        })} 
                                        className={`input-base uppercase ${errors.rg_orgao ? 'input-error' : ''}`} 
                                    />
                                    {errors.rg_orgao && (
                                        <span className="error">{errors.rg_orgao.message}</span>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="label">UF *</label>
                                    <select 
                                        {...register("rg_uf", { 
                                            required: "UF é obrigatória" 
                                        })} 
                                        className={`input-base ${errors.rg_uf ? 'input-error' : ''}`}
                                    >
                                        <option value="">UF</option>
                                        {UFS.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                    </select>
                                    {errors.rg_uf && (
                                        <span className="error">{errors.rg_uf.message}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="label">Nome da Mãe *</label>
                                <input 
                                    {...register("nome_mae", { 
                                        required: "Nome da mãe é obrigatório",
                                        minLength: {
                                            value: 3,
                                            message: "Nome deve ter pelo menos 3 caracteres"
                                        }
                                    })} 
                                    className={`input-base ${errors.nome_mae ? 'input-error' : ''}`} 
                                />
                                {errors.nome_mae && (
                                    <span className="error">{errors.nome_mae.message}</span>
                                )}
                            </div>
                            
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="label">Nome do Pai</label>
                                <input {...register("nome_pai")} className="input-base" />
                            </div>
                        </div>
                    </div>
                )}

                {/* PASSO 3 - COMPLETAMENTE RESPONSIVO */}
                {step === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Localização</h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            {/* CEP */}
                            <div>
                                <label className="label">CEP</label>
                                <div className="relative">
                                    <input 
                                        {...register("cep", {
                                            pattern: {
                                                value: /^\d{5}-\d{3}$/,
                                                message: "CEP inválido"
                                            }
                                        })} 
                                        className={`input-base pr-10 ${errors.cep ? 'input-error' : ''}`} 
                                        onChange={(e) => setValue("cep", mascaraCEP(e.target.value))} 
                                    />
                                    <button type="button" onClick={buscarCep} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-conectiva-navy">
                                        <Search size={18} className="sm:size-5" />
                                    </button>
                                </div>
                                {errors.cep && (
                                    <span className="error">{errors.cep.message}</span>
                                )}
                            </div>
                            
                            {/* Endereço */}
                            <div>
                                <label className="label">Endereço (Rua, Avenida, etc.) *</label>
                                <input 
                                    {...register("endereco", { 
                                        required: "Endereço é obrigatório" 
                                    })} 
                                    id="endereco" 
                                    className={`input-base ${errors.endereco ? 'input-error' : ''}`} 
                                />
                                {errors.endereco && (
                                    <span className="error">{errors.endereco.message}</span>
                                )}
                            </div>
                            
                            {/* Número e Complemento lado a lado em telas médias+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="label">Número *</label>
                                    <input 
                                        id="numero" 
                                        {...register("numero", { 
                                            required: "Número é obrigatório" 
                                        })} 
                                        className={`input-base ${errors.numero ? 'input-error' : ''}`} 
                                    />
                                    {errors.numero && (
                                        <span className="error">{errors.numero.message}</span>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="label">Complemento</label>
                                    <input 
                                        {...register("complemento")} 
                                        className="input-base" 
                                        placeholder="Apto, Bloco, etc."
                                    />
                                </div>
                            </div>
                            
                            {/* Bairro */}
                            <div>
                                <label className="label">Bairro *</label>
                                <input 
                                    {...register("bairro", { 
                                        required: "Bairro é obrigatório" 
                                    })} 
                                    className={`input-base ${errors.bairro ? 'input-error' : ''}`} 
                                />
                                {errors.bairro && (
                                    <span className="error">{errors.bairro.message}</span>
                                )}
                            </div>
                            
                            {/* Cidade e Estado lado a lado em telas médias+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="label">Cidade *</label>
                                    <input 
                                        {...register("cidade", { 
                                            required: "Cidade é obrigatória" 
                                        })} 
                                        className={`input-base ${errors.cidade ? 'input-error' : ''}`} 
                                    />
                                    {errors.cidade && (
                                        <span className="error">{errors.cidade.message}</span>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="label">Estado (UF) *</label>
                                    <select
                                        {...register("estado", { 
                                            required: "UF é obrigatória" 
                                        })} 
                                        className={`input-base ${errors.estado ? 'input-error' : ''}`}
                                    >
                                        <option value="">Selecione UF</option>
                                        {UFS.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                    </select>
                                    {errors.estado && (
                                        <span className="error">{errors.estado.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PASSO 4: REVISÃO --- */}
                {step === 4 && (
                    <div className="animate-fadeIn">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                <CheckCircle size={24} className="sm:size-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Quase lá!</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">Confira os dados. Se precisar mudar algo, clique no lápis.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                            {/* Bloco 1: Dados Pessoais */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 relative group">
                                <button type="button" onClick={() => setStep(1)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-conectiva-navy hover:bg-gray-200 rounded transition" title="Editar Pessoal">
                                    <Edit2 size={14} className="sm:size-4" />
                                </button>
                                <h4 className="font-bold text-gray-400 uppercase text-[10px] sm:text-xs mb-2">Dados Pessoais</h4>
                                <p className="truncate mb-1"><strong>Nome:</strong> {watch('nome_completo')}</p>
                                <p className="mb-1"><strong>Social:</strong> {watch('nome_social') || '-'}</p>
                                <p className="mb-1"><strong>Sexo:</strong> {capitalizar(watch('sexo'))}</p>
                                <p className="mb-1"><strong>Nascimento:</strong> {formatarData(watch('data_nascimento'))}</p>
                                <p className="mb-1"><strong>Celular:</strong> {watch('telefone_celular')}</p>
                                <p className="truncate mb-1"><strong>Email:</strong> {watch('email') || '-'}</p>
                                <p className="mb-0"><strong>Escolaridade:</strong> {watch('escolaridade')}</p>
                            </div>

                            {/* Bloco 2: Documentos */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 relative group">
                                <button type="button" onClick={() => setStep(2)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-conectiva-navy hover:bg-gray-200 rounded transition" title="Editar Documentos">
                                    <Edit2 size={14} className="sm:size-4" />
                                </button>
                                <h4 className="font-bold text-gray-400 uppercase text-[10px] sm:text-xs mb-2">Documentos</h4>
                                <p className="mb-1"><strong>CPF:</strong> {watch('cpf')}</p>
                                <p className="mb-1"><strong>RG:</strong> {watch('rg')}</p>
                                <p className="mb-1"><strong>Órgão:</strong> {watch('rg_orgao')}</p>
                                <p className="mb-1"><strong>UF:</strong> {watch('rg_uf')}</p>
                                <p className="mb-1"><strong>Mãe:</strong> {watch('nome_mae')}</p>
                                <p className="mb-0"><strong>Pai:</strong> {watch('nome_pai') || '-'}</p>
                            </div>

                            {/* Bloco 3: Endereço */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 relative group sm:col-span-2">
                                <button type="button" onClick={() => setStep(3)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-conectiva-navy hover:bg-gray-200 rounded transition" title="Editar Endereço">
                                    <Edit2 size={14} className="sm:size-4" />
                                </button>
                                <h4 className="font-bold text-gray-400 uppercase text-[10px] sm:text-xs mb-2">Endereço</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    <p className="mb-1"><strong>CEP:</strong> {watch('cep') || '-'}</p>
                                    <p className="mb-1 sm:col-span-2 lg:col-span-1"><strong>Endereço:</strong> {watch('endereco')}</p>
                                    <p className="mb-1"><strong>Número:</strong> {watch('numero')}</p>
                                    <p className="mb-1"><strong>Bairro:</strong> {watch('bairro')}</p>
                                    <p className="mb-1"><strong>Cidade:</strong> {watch('cidade')}</p>
                                    <p className="mb-0"><strong>Estado:</strong> {watch('estado')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIONS para passos 1-3 */}
                {step < 4 && (
                    <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-4">
                        <div>
                            {step > 1 ? (
                                <button type="button" onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 w-full sm:w-auto text-sm sm:text-base">
                                    <ArrowLeft size={16} className="sm:size-[18px]" /> Voltar
                                </button>
                            ) : null}
                        </div>

                        <button type="button" onClick={handleNextStep} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-conectiva-navy text-white hover:bg-slate-800 shadow-lg w-full sm:w-auto text-sm sm:text-base">
                            {step === 3 ? 'Ir para Revisão' : 'Próximo'} <ArrowRight size={16} className="sm:size-[18px]" />
                        </button>
                    </div>
                )}

                {/* ACTIONS para passo 4 */}
                {step === 4 && (
                    <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 gap-3 sm:gap-4">
                        <button type="button" onClick={() => setStep(3)} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 w-full sm:w-auto text-sm sm:text-base">
                            <ArrowLeft size={16} className="sm:size-[18px]" /> Voltar para Endereço
                        </button>

                        <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-conectiva-lime text-conectiva-navy font-bold hover:bg-[#bfff00] shadow-lg disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base">
                            {saving ? 'Salvando...' : (isEditMode ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR MATRÍCULA')}
                        </button>
                    </div>
                )}
            </form>

            <style>{`
                .label { 
                    display: block; 
                    font-size: 0.8125rem; 
                    font-weight: 500; 
                    color: #374151; 
                    margin-bottom: 0.25rem; 
                }
                .input-base { 
                    width: 100%; 
                    padding: 0.625rem 0.875rem; 
                    border: 1px solid #d1d5db; 
                    border-radius: 0.5rem; 
                    outline: none; 
                    transition: all 0.2s; 
                    background: white; 
                    font-size: 0.875rem;
                }
                .input-base:focus { 
                    border-color: #ccff00; 
                    ring: 2px solid #ccff00; 
                    box-shadow: 0 0 0 3px rgba(204, 255, 0, 0.2); 
                }
                .input-error { 
                    border-color: #ef4444 !important; 
                    background-color: #fef2f2;
                }
                .input-error:focus { 
                    border-color: #dc2626 !important; 
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important; 
                }
                .error { 
                    display: block;
                    font-size: 0.75rem; 
                    color: #ef4444; 
                    margin-top: 0.25rem; 
                }
                
                @media (min-width: 640px) {
                    .label { 
                        font-size: 0.875rem; 
                    }
                    .input-base { 
                        padding: 0.75rem 1rem; 
                        font-size: 0.9375rem; 
                    }
                }
                
                /* Garante que não haverá overflow horizontal */
                html, body {
                    overflow-x: hidden;
                }
                
                /* Remove scroll horizontal em telas pequenas */
                @media (max-width: 640px) {
                    .max-w-full {
                        max-width: 100vw;
                    }
                }
            `}</style>
        </div>
    );
}