import React, { useState, useEffect } from 'react';
import { User, MapPin, FileText, CheckCircle, ArrowRight, ArrowLeft, Search, Briefcase, GraduationCap, Edit, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function CadastroProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [step, setStep] = useState(1);
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditIcons, setShowEditIcons] = useState(false);

  const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const { register, handleSubmit, setValue, watch, trigger, reset, formState: { errors, isValid, touchedFields } } = useForm({
    mode: 'onChange',
    defaultValues: {
      sexo: '',
      escolaridade: '',
      vinculo: '',
      carga_horaria: '',
      area_atuacao: ''
    }
  });

  const cepDigitado = watch('cep');
  const allFields = watch();

  // --- CARREGAR DADOS NA EDIÇÃO ---
  useEffect(() => {
    if (isEditMode) {
      apiService.getProfessorById(id)
        .then(dados => {
          if (dados.data_nascimento) dados.data_nascimento = dados.data_nascimento.split('T')[0];
          if (dados.data_contratacao) dados.data_contratacao = dados.data_contratacao.split('T')[0];
          reset(dados);
        })
        .catch(err => alert("Erro ao carregar professor (MOCK)."));
    }
  }, [id, isEditMode, reset]);

  useEffect(() => {
    setShowEditIcons(step === 4);
  }, [step]);

  // --- MÁSCARAS ---
  const mascaraCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const mascaraTelefone = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
  const mascaraCEP = (v) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');

  // --- VALIDAÇÕES ---
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) || "Email inválido";
  };

  const validarCPF = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return "CPF deve ter 11 dígitos";
    return true;
  };

  // --- NAVEGAÇÃO ENTRE PASSOS ---
  const handleNextStep = async () => {
    let campos = [];
    if (step === 1) campos = ['nome_completo', 'sexo', 'data_nascimento', 'telefone_celular', 'email', 'escolaridade'];
    if (step === 2) campos = ['matricula', 'vinculo', 'carga_horaria', 'area_atuacao', 'cpf', 'nome_mae']; // Atualizado
    if (step === 3) campos = ['numero', 'endereco', 'bairro', 'cidade', 'estado'];

    const isValid = await trigger(campos);
    if (isValid) {
      setStep(prev => prev + 1);
    } else {
      const primeiroErro = document.querySelector('.error-message');
      if (primeiroErro) {
        primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
    setShowEditIcons(false);
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const buscarCep = async () => {
    const cep = cepDigitado?.replace(/\D/g, '');
    if (cep?.length === 8) {
      setLoadingCep(true);
      try {
        const data = await apiService.buscarCep(cep);
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
        await apiService.updateProfessor(id, dadosLimpos);
        alert("✅ Professor atualizado! (MOCK)");
      } else {
        await apiService.createProfessor(dadosLimpos);
        alert(`✅ Professor cadastrado com sucesso! (MOCK)`);
      }
      navigate('/professores');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao salvar.";
      alert(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-4 sm:mb-6 px-2">
      {[
        { num: 1, icon: User, label: "Pessoal" },
        { num: 2, icon: Briefcase, label: "Profissional" },
        { num: 3, icon: MapPin, label: "Endereço" },
        { num: 4, icon: CheckCircle, label: "Revisão" }
      ].map((s, index) => (
        <div key={s.num} className="flex items-center">
          <div className={`flex flex-col items-center relative z-10 ${step >= s.num ? 'text-seduc-primary' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${step >= s.num ? 'bg-seduc-secondary border-seduc-primary text-seduc-primary' : 'bg-white border-gray-200'
              }`}>
              {step > s.num ? <CheckCircle size={14} className="sm:size-[18px]" /> : <s.icon size={12} className="sm:size-[16px]" />}
            </div>
            <span className="text-[10px] sm:text-xs font-bold mt-1 sm:mt-2 uppercase tracking-wide text-center px-1">{s.label}</span>
          </div>
          {index < 3 && <div className={`w-6 sm:w-12 h-1 mx-1 sm:mx-2 -mt-4 sm:-mt-6 transition-all duration-500 ${step > s.num ? 'bg-seduc-primary' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  const ErrorMessage = ({ error }) => (
    error && (
      <div className="error-message flex items-center gap-1 mt-1 text-red-500 text-xs">
        <AlertCircle size={10} className="sm:size-[12px]" />
        <span className="text-[10px] sm:text-xs">{error.message || "Campo obrigatório"}</span>
      </div>
    )
  );

  const getInputClass = (fieldName) => {
    const baseClass = "input-base";
    const errorClass = errors[fieldName] ? "input-error" : "";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:max-w-6xl lg:mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-seduc-primary">
            {isEditMode ? 'Editar Professor' : 'Novo Professor'}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {isEditMode ? 'Atualize os dados docentes.' : 'Cadastro de corpo docente.'}
          </p>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Passo {step} de 4</span>
      </div>

      <StepIndicator />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* PASSO 1: PESSOAL */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            {showEditIcons && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  onClick={() => goToStep(4)}
                >
                  <ArrowLeft size={12} className="sm:size-[14px]" /> Voltar para revisão
                </button>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              Dados Pessoais
              {showEditIcons && (
                <span className="text-xs sm:text-sm font-normal text-gray-500 flex items-center gap-1">
                  <CheckCircle size={12} className="sm:size-[14px]" /> Editando
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="label">Nome Completo *</label>
                <input
                  {...register("nome_completo", {
                    required: "Nome completo é obrigatório",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" }
                  })}
                  className={getInputClass("nome_completo")}
                />
                <ErrorMessage error={errors.nome_completo} />
              </div>
              <div>
                <label className="label">Data de Nascimento *</label>
                <input
                  type="date"
                  {...register("data_nascimento", {
                    required: "Data de nascimento é obrigatória",
                    validate: {
                      dataValida: (value) => {
                        if (!value) return true;
                        const data = new Date(value);
                        const hoje = new Date();
                        return data < hoje || "Data deve ser anterior a hoje";
                      }
                    }
                  })}
                  className={getInputClass("data_nascimento")}
                />
                <ErrorMessage error={errors.data_nascimento} />
              </div>
              <div>
                <label className="label">Sexo *</label>
                <select
                  {...register("sexo", { required: "Selecione o sexo" })}
                  className={getInputClass("sexo")}
                >
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
                <ErrorMessage error={errors.sexo} />
              </div>
              <div>
                <label className="label">Celular *</label>
                <input
                  {...register("telefone_celular", {
                    required: "Celular é obrigatório",
                    pattern: {
                      value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                      message: "Formato: (99) 99999-9999"
                    }
                  })}
                  className={getInputClass("telefone_celular")}
                  onChange={(e) => setValue("telefone_celular", mascaraTelefone(e.target.value))}
                />
                <ErrorMessage error={errors.telefone_celular} />
              </div>
              <div>
                <label className="label">Email Pessoal *</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email é obrigatório",
                    validate: validarEmail
                  })}
                  className={getInputClass("email")}
                />
                <ErrorMessage error={errors.email} />
              </div>
              <div>
                <label className="label">Escolaridade *</label>
                <select
                  {...register("escolaridade", { required: "Escolaridade é obrigatória" })}
                  className={getInputClass("escolaridade")}
                >
                  <option value="">Selecione...</option>
                  <option value="Superior Completo">Superior Completo</option>
                  <option value="Pós-Graduação">Pós-Graduação (Espec/Mest/Dout)</option>
                </select>
                <ErrorMessage error={errors.escolaridade} />
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: PROFISSIONAL */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            {showEditIcons && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  className="text-xs sm:text-sm text-seduc-primary hover:text-green-800 flex items-center gap-1"
                  onClick={() => goToStep(4)}
                >
                  <ArrowLeft size={12} className="sm:size-[14px]" /> Voltar para revisão
                </button>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              Dados Profissionais e Docs
              {showEditIcons && (
                <span className="text-xs sm:text-sm font-normal text-gray-500 flex items-center gap-1">
                  <CheckCircle size={12} className="sm:size-[14px]" /> Editando
                </span>
              )}
            </h3>

            {/* Bloco de Vínculo Funcional */}
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100 mb-4">
              <h4 className="font-bold text-seduc-primary text-sm mb-2 sm:mb-3 flex items-center gap-2">
                <GraduationCap size={14} className="sm:size-[16px]" /> Dados Profissionais
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

                {/* Matrícula */}
                <div>
                  <label className="label text-green-900">Matrícula *</label>
                  <input
                    {...register("matricula", {
                      required: "Matrícula é obrigatória",
                      minLength: { value: 3, message: "Mínimo 3 dígitos" }
                    })}
                    className={`${getInputClass("matricula")} border-green-200`}
                    placeholder="Ex: 123456"
                  />
                  <ErrorMessage error={errors.matricula} />
                </div>

                {/* Vínculo */}
                <div>
                  <label className="label text-green-900">Vínculo *</label>
                  <select
                    {...register("vinculo", { required: "Selecione o vínculo" })}
                    className={`${getInputClass("vinculo")} border-green-200`}
                  >
                    <option value="">Selecione...</option>
                    <option value="Concursado">Concursado (Efetivo)</option>
                    <option value="Contrato Temporário">Contrato Temporário</option>
                    <option value="Comissionado">Comissionado</option>
                    <option value="Permuta">Permuta</option>
                  </select>
                  <ErrorMessage error={errors.vinculo} />
                </div>

                {/* Carga Horária */}
                <div>
                  <label className="label text-green-900">Carga Horária *</label>
                  <select
                    {...register("carga_horaria", { required: "Selecione a CH" })}
                    className={`${getInputClass("carga_horaria")} border-green-200`}
                  >
                    <option value="">Selecione...</option>
                    <option value="100h">100h Mensais</option>
                    <option value="150h">150h Mensais</option>
                    <option value="180h">180h Mensais</option>
                    <option value="200h">200h Mensais</option>
                  </select>
                  <ErrorMessage error={errors.carga_horaria} />
                </div>

                {/* Área de Atuação */}
                <div>
                  <label className="label text-green-900">Área de Atuação *</label>
                  <select
                    {...register("area_atuacao", { required: "Selecione a área" })}
                    className={`${getInputClass("area_atuacao")} border-green-200`}
                  >
                    <option value="">Selecione...</option>
                    <option value="Polivalente">Polivalente (Anos Iniciais/Infantil)</option>
                    <option value="Língua Portuguesa">Língua Portuguesa</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Ciências">Ciências</option>
                    <option value="História">História</option>
                    <option value="Geografia">Geografia</option>
                    <option value="Educação Física">Educação Física</option>
                    <option value="Artes">Artes</option>
                    <option value="Inglês">Inglês</option>
                  </select>
                  <ErrorMessage error={errors.area_atuacao} />
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="label">CPF *</label>
                <input
                  {...register("cpf", {
                    required: "CPF é obrigatório",
                    validate: validarCPF
                  })}
                  className={getInputClass("cpf")}
                  onChange={(e) => setValue("cpf", mascaraCPF(e.target.value))}
                />
                <ErrorMessage error={errors.cpf} />
              </div>
              <div>
                <label className="label">RG</label>
                <input {...register("rg")} className="input-base" />
              </div>
              <div>
                <label className="label">Data Contratação</label>
                <input
                  type="date"
                  {...register("data_contratacao", {
                    validate: {
                      dataValida: (value) => {
                        if (!value) return true;
                        const data = new Date(value);
                        return !isNaN(data.getTime()) || "Data inválida";
                      }
                    }
                  })}
                  className={getInputClass("data_contratacao")}
                />
                <ErrorMessage error={errors.data_contratacao} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="label">Nome da Mãe (Obrigatório Legal) *</label>
                <input
                  {...register("nome_mae", {
                    required: "Nome da mãe é obrigatório",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" }
                  })}
                  className={getInputClass("nome_mae")}
                />
                <ErrorMessage error={errors.nome_mae} />
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3: ENDEREÇO */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            {showEditIcons && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  className="text-xs sm:text-sm text-seduc-primary hover:text-green-800 flex items-center gap-1"
                  onClick={() => goToStep(4)}
                >
                  <ArrowLeft size={12} className="sm:size-[14px]" /> Voltar para revisão
                </button>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              Localização
              {showEditIcons && (
                <span className="text-xs sm:text-sm font-normal text-gray-500 flex items-center gap-1">
                  <CheckCircle size={12} className="sm:size-[14px]" /> Editando
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* CEP */}
              <div>
                <label className="label">CEP</label>
                <div className="relative">
                  <input
                    {...register("cep", {
                      pattern: {
                        value: /^\d{5}-\d{3}$/,
                        message: "Formato: 12345-678"
                      }
                    })}
                    className={getInputClass("cep")}
                    onChange={(e) => setValue("cep", mascaraCEP(e.target.value))}
                  />
                  <button type="button" onClick={buscarCep} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-seduc-primary">
                    <Search size={16} className="sm:size-[20px]" />
                  </button>
                </div>
                <ErrorMessage error={errors.cep} />
              </div>

              {/* Endereço */}
              <div>
                <label className="label">Endereço *</label>
                <input
                  {...register("endereco", { required: "Endereço é obrigatório" })}
                  id="endereco"
                  className={getInputClass("endereco")}
                />
                <ErrorMessage error={errors.endereco} />
              </div>

              {/* Número e Complemento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="label">Número *</label>
                  <input
                    id="numero"
                    {...register("numero", { required: "Número é obrigatório" })}
                    className={getInputClass("numero")}
                  />
                  <ErrorMessage error={errors.numero} />
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
                  {...register("bairro", { required: "Bairro é obrigatório" })}
                  className={getInputClass("bairro")}
                />
                <ErrorMessage error={errors.bairro} />
              </div>

              {/* Cidade e UF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="label">Cidade *</label>
                  <input
                    {...register("cidade", { required: "Cidade é obrigatória" })}
                    className={getInputClass("cidade")}
                  />
                  <ErrorMessage error={errors.cidade} />
                </div>

                <div>
                  <label className="label">UF *</label>
                  <input
                    {...register("estado", {
                      required: "UF é obrigatória",
                      pattern: {
                        value: /^[A-Z]{2}$/,
                        message: "2 letras maiúsculas"
                      }
                    })}
                    className={getInputClass("estado")}
                  />
                  <ErrorMessage error={errors.estado} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: REVISÃO */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-seduc-primary">
                <Briefcase size={20} className="sm:size-[32px]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {isEditMode ? 'Confirmar Edição?' : 'Confirmar Contratação?'}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Revise os dados abaixo.</p>
              {Object.keys(errors).length > 0 && (
                <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
                    <AlertCircle size={14} className="sm:size-[16px]" />
                    Existem campos obrigatórios não preenchidos
                  </p>
                </div>
              )}
            </div>

            {/* Seção 1: Dados Pessoais */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 mb-4 relative">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <User size={14} className="sm:size-[16px]" /> Dados Pessoais
                </h4>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex items-center gap-1 text-xs sm:text-sm text-seduc-primary hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 sm:px-3 py-1 rounded-full transition-colors"
                >
                  <Edit size={12} className="sm:size-[14px]" /> Editar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <p><strong>Nome:</strong> {allFields.nome_completo || 'Não informado'}</p>
                <p><strong>Data Nasc:</strong> {formatarData(allFields.data_nascimento)}</p>
                <p><strong>Sexo:</strong> {allFields.sexo || 'Não informado'}</p>
                <p><strong>Celular:</strong> {allFields.telefone_celular || 'Não informado'}</p>
                <p><strong>Email:</strong> {allFields.email || 'Não informado'}</p>
                <p><strong>Escolaridade:</strong> {allFields.escolaridade || 'Não informado'}</p>
              </div>
            </div>

            {/* Seção 2: Dados Profissionais */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 mb-4 relative">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <Briefcase size={14} className="sm:size-[16px]" /> Dados Profissionais
                </h4>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-1 text-xs sm:text-sm text-seduc-primary hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 sm:px-3 py-1 rounded-full transition-colors"
                >
                  <Edit size={12} className="sm:size-[14px]" /> Editar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <p><strong>Matrícula:</strong> {allFields.matricula || '---'}</p>
                <p><strong>Vínculo:</strong> {allFields.vinculo || '---'}</p>
                <p><strong>Carga Horária:</strong> {allFields.carga_horaria || '---'}</p>
                <p><strong>Área de Atuação:</strong> {allFields.area_atuacao || '---'}</p>
                <p className="border-t pt-2 mt-2 sm:col-span-2"><strong>CPF:</strong> {allFields.cpf || 'Não informado'}</p>
                <p><strong>RG:</strong> {allFields.rg || 'Não informado'}</p>
                <p><strong>Data Contratação:</strong> {formatarData(allFields.data_contratacao)}</p>
                <p className="sm:col-span-2"><strong>Nome da Mãe:</strong> {allFields.nome_mae || 'Não informado'}</p>
              </div>
            </div>

            {/* Seção 3: Endereço */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 relative">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin size={14} className="sm:size-[16px]" /> Endereço
                </h4>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="flex items-center gap-1 text-xs sm:text-sm text-seduc-primary hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 sm:px-3 py-1 rounded-full transition-colors"
                >
                  <Edit size={12} className="sm:size-[14px]" /> Editar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <p><strong>CEP:</strong> {allFields.cep || 'Não informado'}</p>
                <p><strong>Endereço:</strong> {allFields.endereco || 'Não informado'}, {allFields.numero || ''}</p>
                <p><strong>Bairro:</strong> {allFields.bairro || 'Não informado'}</p>
                <p><strong>Cidade/UF:</strong> {allFields.cidade || ''} - {allFields.estado || ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-4">
          <div>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 w-full sm:w-auto text-sm sm:text-base">
                <ArrowLeft size={14} className="sm:size-[18px]" /> Voltar
              </button>
            ) : null}
          </div>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-seduc-primary text-white hover:bg-white hover:text-seduc-primary border border-transparent hover:border-seduc-primary shadow-lg w-full sm:w-auto text-sm sm:text-base"
            >
              {step === 3 ? 'Ir para Revisão' : 'Próximo'} <ArrowRight size={14} className="sm:size-[18px]" />
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 w-full sm:w-auto text-sm sm:text-base"
              >
                <ArrowLeft size={14} className="sm:size-[18px]" /> Voltar para Endereço
              </button>
              <button
                type="submit"
                disabled={saving || Object.keys(errors).length > 0}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-seduc-primary text-white font-bold hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto text-sm sm:text-base"
              >
                {saving ? 'Salvando...' : (isEditMode ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO')}
              </button>
            </div>
          )}
        </div>
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
          border-color: #069603; 
          box-shadow: 0 0 0 3px rgba(6, 150, 3, 0.2); 
        }
        .input-error { 
          border-color: #ef4444 !important; 
          background-color: #fef2f2;
        }
        .input-error:focus { 
          border-color: #dc2626 !important; 
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important; 
        }
        .error-message { 
          font-size: 0.75rem; 
          color: #ef4444; 
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        html, body {
          overflow-x: hidden;
        }
        
        @media (max-width: 640px) {
          .max-w-full {
            max-width: 100vw;
          }
        }
      `}</style>
    </div>
  );
}