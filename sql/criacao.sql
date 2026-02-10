-- =======================================================
-- 0. CONFIGURAÇÃO INICIAL (Limpeza e Criação)
-- =======================================================
DROP DATABASE IF EXISTS sys_escola_tecnica;
CREATE DATABASE sys_escola_tecnica;
USE sys_escola_tecnica;

-- =======================================================
-- BLOCO 1: GENTE E ACESSO (CORE)
-- =======================================================

DROP TABLE IF EXISTS notas;
DROP TABLE IF EXISTS avaliacoes;
DROP TABLE IF EXISTS frequencias;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS alocacao_professores;
DROP TABLE IF EXISTS turma_disciplinas;
DROP TABLE IF EXISTS turmas;
DROP TABLE IF EXISTS disciplinas;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS professores;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS pessoas;

-- 1.1 Tabela MÃE
CREATE TABLE pessoas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(150) NOT NULL,
    nome_social VARCHAR(150),
    data_nascimento DATE NOT NULL,
    sexo ENUM('Masculino', 'Feminino', 'Outro') NOT NULL,
    nome_mae VARCHAR(150) NOT NULL,
    nome_pai VARCHAR(150),
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    rg_orgao_emissor VARCHAR(20),
    rg_uf_emissor CHAR(2),
    escolaridade VARCHAR(50) NOT NULL, -- Simplifiquei o ENUM para VARCHAR pra evitar erros de string
    cep VARCHAR(9),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    telefone_celular VARCHAR(20) NOT NULL,
    telefone_emergencia VARCHAR(20),
    email VARCHAR(100),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Alunos
CREATE TABLE alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id INT NOT NULL,
    matricula VARCHAR(20) UNIQUE,
    status_financeiro ENUM('Em dia', 'Inadimplente', 'Bolsista') DEFAULT 'Em dia',
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE

);

-- 1.3 Professores
CREATE TABLE professores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id INT NOT NULL,
    conselho_tipo ENUM('COREN', 'CRM', 'CREFITO', 'CRP', 'CRN', 'LICENCIATURA', 'OUTROS') NOT NULL,
    conselho_numero VARCHAR(20) NOT NULL,
    conselho_uf CHAR(2) NOT NULL,
    data_contratacao DATE,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE
);

-- 1.4 Usuários (Login)
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Master', 'Coordenacao', 'Secretaria', 'Professor', 'Aluno') NOT NULL,
    pessoa_id INT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE SET NULL
);

-- =======================================================
-- BLOCO 2: ESTRUTURA ACADÊMICA
-- =======================================================

-- 2.1 Cursos
CREATE TABLE cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(10) NOT NULL,
    carga_horaria_total INT,
    ativo BOOLEAN DEFAULT TRUE
);

-- 2.2 Catálogo de Disciplinas (O que o curso oferece)
CREATE TABLE disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    carga_horaria INT NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- 2.3 Turmas
CREATE TABLE turmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    codigo VARCHAR(20),  -- Ex: ENF-2026.1-MANHA
    periodo VARCHAR(20), -- Ex: 2026.1
    turno ENUM('Manhã', 'Tarde', 'Noite', 'Integral'),
    data_inicio DATE,
    data_fim DATE,
    ativa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- 2.4 Escolas
CREATE TABLE escolas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(100) NOT NULL,
    cep VARCHAR(8) NOT NULL -- futuramente pode por um campo com uma busca automática de endereço
);

-- =======================================================
-- BLOCO 3: VÍNCULOS INTELIGENTES (AQUI ESTÁ A MÁGICA)
-- =======================================================

-- 3.1 Grade da Turma (Quais matérias ESSA turma vai ter?)
CREATE TABLE turma_disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    
    -- Garante que não duplique a mesma matéria na mesma turma
    UNIQUE KEY turma_disciplina_unico (turma_id, disciplina_id)
);

-- 3.2 Alocação de Professores (Quem dá aula do quê e quando)
-- RESOLVE: Múltiplos professores e Troca de professores
CREATE TABLE alocacao_professores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_disciplina_id INT NOT NULL, -- Amarra o prof à Matéria daquela Turma
    professor_id INT NOT NULL,
    
    data_inicio DATE NOT NULL, -- Quando assumiu
    data_fim DATE,             -- Quando saiu (NULL = Atual)
    ativo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
);

-- 3.3 Matrículas dos Alunos
CREATE TABLE matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    aluno_id INT NOT NULL,
    data_matricula DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Ativo', 'Trancado', 'Concluido', 'Desistente', 'Reprovado') DEFAULT 'Ativo',
    
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    UNIQUE KEY aluno_turma_unico (turma_id, aluno_id)
);

-- =======================================================
-- BLOCO 4: OPERAÇÃO DIÁRIA (AULAS E AVALIAÇÕES)
-- =======================================================

-- 4.1 Diário de Aula
CREATE TABLE aulas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_disciplina_id INT NOT NULL, -- Sabendo a matéria da turma, sabemos a turma e a matéria
    professor_id INT NOT NULL, -- Quem deu a aula (Histórico preservado)
    
    data_aula DATE NOT NULL,
    conteudo TEXT, 
    numero_aulas INT DEFAULT 1,
    
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES professores(id)
);

-- 4.2 Frequência
CREATE TABLE frequencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aula_id INT NOT NULL,
    matricula_id INT NOT NULL,
    
    status ENUM('Presente', 'Ausente', 'Justificado') NOT NULL,
    observacao VARCHAR(255),
    
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
);

-- 4.3 Definição de Avaliações (NOVO!)
-- O Professor cria: "Prova 1", "Seminário", etc.
CREATE TABLE avaliacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_disciplina_id INT NOT NULL, -- Pertence à matéria X da turma Y
    professor_id INT NOT NULL, -- Quem criou a prova
    
    nome VARCHAR(100) NOT NULL, -- Ex: "Prova Parcial"
    data_agendada DATE,
    valor_maximo DECIMAL(4,2) DEFAULT 10.00, -- Vale 10.00
    peso INT DEFAULT 1, -- Peso 1, Peso 2...
    
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES professores(id)
);

-- 4.4 Notas dos Alunos (NOVO!)
-- Onde fica o "8.5" do Joãozinho
CREATE TABLE notas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    avaliacao_id INT NOT NULL,
    matricula_id INT NOT NULL, -- Link com o aluno na turma
    
    nota_obtida DECIMAL(4,2), -- Ex: 08.50
    observacao VARCHAR(200),
    data_lancamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
    UNIQUE KEY nota_unica (avaliacao_id, matricula_id) -- Aluno só tem 1 nota por prova
);

-- =======================================================
-- SEED: USUÁRIO ADMIN (Pra você não ficar trancado fora)
-- =======================================================
INSERT INTO cursos (nome, sigla, carga_horaria_total, ativo) 
VALUES ('Técnico em Enfermagem', 'TEC-ENF', 1200, 1);


-- ==================================================
-- 2. INSERIR USUÁRIO DA COORDENAÇÃO (Login Admin)
-- ==================================================
-- Login: coord@escola.com
-- Senha: 123456
-- Perfil: Coordenacao (Acessa Sidebar, Dashboard, Cadastros)
-- pessoa_id: NULL (Pois é um usuário administrativo, não é aluno nem prof)

INSERT INTO usuarios (nome, email, senha, perfil, pessoa_id, ativo) 
VALUES (
    'Amanda Xavier', 
    'amanda.xavier@conectiva.com', 
    '$2b$10$BDtcbypUEovZHipELUKJs.g9IL2.zQQskc.SKUJIJJ9nJnjBAZe8K', -- Hash para "Connectiva2026!@"
    'Coordenacao', 
    NULL, 
    1
);


INSERT INTO usuarios (nome, email, senha, perfil, pessoa_id, ativo) 
VALUES (
    'Carlos Castro', 
    'carlos.castro@conectiva.com', 
    '$2b$10$kdNN.CHeYZ0yTWImDTd9Neyp7V5/tYO0wiH87zfT65JqhumCwHViS', -- Senha: 123456
    'Professor', 
    8, -- <--- MUITO IMPORTANTE: Esse ID tem que existir na tabela 'pessoas' e 'professores'
    1
);
-- LEMBRETE: Depois a gente troca essa senha '123456' pelo hash bcrypt no sistema!


-- =======================================================
-- MIGRATION SCRIPT: EXPANSÃO DE NÍVEIS E PLANEJAMENTO
-- DATA: 2026-02-09
-- =======================================================

USE sys_escola_tecnica;

-- 1. ATUALIZAR TABELA TURMAS
-- Adiciona a coluna para distinguir o nível de ensino
-- Isso é crucial para o frontend saber quais campos de planejamento exibir
ALTER TABLE turmas 
ADD COLUMN nivel_ensino ENUM('Infantil', 'Iniciais_1_2', 'Iniciais_3_5', 'Finais') NOT NULL DEFAULT 'Finais' AFTER turno;

-- 2. NOVA TABELA: PLANEJAMENTOS
-- Vinculada à alocação do professor (Turma + Disciplina + Professor)
-- Centraliza tanto o planejamento Infantil quanto o Fundamental em uma estrutura única (Single Table Inheritance strategy)
CREATE TABLE planejamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    alocacao_id INT NOT NULL,
    
    -- Campos Gerais (Comuns a todos)
    data_referencia DATE NOT NULL, -- Pode ser a data da aula ou o início da semana
    conteudo TEXT,
    metodologia TEXT,
    objetivos TEXT, -- Ou "Campos de Experiência" no Infantil
    materiais TEXT, -- Recursos Didáticos
    
    -- Campos Específicos: EDUCAÇÃO INFANTIL
    registro_vivencia TEXT,        -- O que aconteceu de fato?
    proposta_desenvolvimento TEXT, -- O que será trabalhado?
    organizacao_espaco TEXT,       -- Como o ambiente foi preparado?
    
    -- Campos Específicos: ENSINO FUNDAMENTAL
    atividades_casa TEXT,
    unidade_tematica VARCHAR(255),
    competencias_bncc TEXT,        -- Códigos ou descrição das habilidades
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chave Estrangeira com CASCADE (Se a alocação sumir, o plano some)
    FOREIGN KEY (alocacao_id) REFERENCES alocacao_professores(id) ON DELETE CASCADE
);

-- 3. NOVA TABELA: AVALIAÇÕES DESCRITIVAS
-- Para registros qualitativos (Pareceres, Fichas de Acompanhamento)
-- Vinculado à Matrícula (Aluno na Turma) e quem escreveu (Professor)
CREATE TABLE avaliacoes_descritivas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricula_id INT NOT NULL,
    professor_id INT NOT NULL,
    
    tipo ENUM('Parecer_Descritivo', 'Registro_Conquista', 'Observacao_Individual') NOT NULL,
    referencia VARCHAR(50) NOT NULL, -- Ex: "1º Bimestre", "1º Semestre", "Fevereiro"
    
    descricao TEXT NOT NULL, -- O texto do parecer
    
    data_lancamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professores(id)
);

-- 4. NOVA TABELA: CALENDÁRIO LETIVO
-- Bloqueio de datas para o sistema de frequência
CREATE TABLE calendario_letivo (
    data DATE PRIMARY KEY, -- A data é a própria chave
    tipo_dia ENUM('Letivo', 'Feriado', 'Recesso', 'Planejamento', 'Conselho_Classe', 'Outro') NOT NULL,
    descricao VARCHAR(100), -- Ex: "Feriado de Carnaval"
    dia_letivo BOOLEAN DEFAULT TRUE -- Se FALSE, bloqueia lançamento de aula/frequência
);

-- DADOS INICIAIS DE EXEMPLO (OPCIONAL)
-- Inserir alguns feriados nacionais para teste
INSERT INTO calendario_letivo (data, tipo_dia, descricao, dia_letivo) VALUES 
('2026-01-01', 'Feriado', 'Confraternização Universal', 0),
('2026-04-21', 'Feriado', 'Tiradentes', 0),
('2026-05-01', 'Feriado', 'Dia do Trabalho', 0),
('2026-09-07', 'Feriado', 'Independência do Brasil', 0),
('2026-10-12', 'Feriado', 'Nossa Senhora Aparecida', 0),
('2026-11-02', 'Feriado', 'Finados', 0),
('2026-11-15', 'Feriado', 'Proclamação da República', 0),
('2026-12-25', 'Feriado', 'Natal', 0);
