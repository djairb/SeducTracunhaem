-- =======================================================
-- 1. CONFIGURAÇÃO E HIERARQUIA INICIAL
-- =======================================================
DROP DATABASE IF EXISTS sys_seduc_municipal;
CREATE DATABASE sys_seduc_municipal;
USE sys_seduc_municipal;

-- 1.1 Controle de Períodos e Calendário 
CREATE TABLE anos_letivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ano INT UNIQUE NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status ENUM('Planejamento', 'Ativo', 'Encerrado') DEFAULT 'Planejamento'
);

CREATE TABLE calendario_escolar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ano_letivo_id INT NOT NULL,
    data DATE NOT NULL,
    tipo ENUM('Letivo', 'Feriado', 'Recesso', 'Final_de_Semana') DEFAULT 'Letivo',
    descricao VARCHAR(100),
    bloqueado BOOLEAN DEFAULT FALSE, -- Bloqueio de dias não letivos 
    FOREIGN KEY (ano_letivo_id) REFERENCES anos_letivos(id)
);

-- 1.2 Estrutura Organizacional
CREATE TABLE escolas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    inep VARCHAR(20) UNIQUE,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pessoas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NULL, -- Flexível para alunos sem CPF
    rg_ou_certidao VARCHAR(50),
    data_nascimento DATE NOT NULL,
    nome_mae VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    telefone_celular VARCHAR(20)
);

-- =======================================================
-- 2. ACESSOS E PERFIS [cite: 1, 6, 7, 9]
-- =======================================================

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Master', 'Coordenacao', 'Secretaria', 'Professor') NOT NULL,
    pessoa_id INT NULL,
    escola_id INT NULL,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE SET NULL,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE SET NULL
);

-- =======================================================
-- 3. ATORES ACADÊMICOS E MATRÍCULA [cite: 2, 4]
-- =======================================================

CREATE TABLE professores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id INT NOT NULL,
    escola_id INT NOT NULL,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE
);

CREATE TABLE alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id INT NOT NULL,
    escola_id INT NOT NULL,
    matricula_geral VARCHAR(20) UNIQUE,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE
);

CREATE TABLE disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    carga_horaria_anual INT DEFAULT 80,
    nivel_ensino ENUM('Infantil', 'Iniciais', 'Finais') NOT NULL
);

CREATE TABLE turmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    escola_id INT NOT NULL,
    ano_letivo_id INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    nivel_ensino ENUM('Infantil', 'Iniciais', 'Finais') NOT NULL,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE,
    FOREIGN KEY (ano_letivo_id) REFERENCES anos_letivos(id)
);

CREATE TABLE turma_disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    professor_id INT NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES professores(id)
);

CREATE TABLE matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    aluno_id INT NOT NULL,
    status ENUM('Ativo', 'Transferido', 'Remanejado', 'Desistente', 'Concluido') DEFAULT 'Ativo', [cite: 4]
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

-- =======================================================
-- 4. DIÁRIO E PLANEJAMENTO [cite: 10, 11, 15, 16, 20, 21, 24, 25]
-- =======================================================

CREATE TABLE planejamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_disciplina_id INT NOT NULL,
    data_aula DATE NOT NULL,
    hora_aula INT DEFAULT 1,
    conteudo TEXT,
    metodologia TEXT,
    objetivos_aprendizagem TEXT,
    materiais_utilizados TEXT, -- Requisito transversal 
    
    -- Específicos Infantil 
    remanejar_ampliar TEXT,
    registro_vivencia TEXT,
    proposta_desenvolvimento TEXT,
    organizacao_tempo_espaco TEXT,
    
    -- Específicos Fundamental [cite: 16, 21, 25]
    atividades_casa TEXT,
    unidade_tematica TEXT,
    competencias_bncc TEXT,
    avaliacao_metodo TEXT,

    -- Controle da Coordenação 
    analisado BOOLEAN DEFAULT FALSE,
    data_analise DATETIME,
    
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id) ON DELETE CASCADE
);

CREATE TABLE frequencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    planejamento_id INT NOT NULL,
    matricula_id INT NOT NULL,
    status ENUM('Presente', 'Ausente', 'Justificado') NOT NULL, [cite: 10, 15, 20, 24]
    quantidade_faltas INT DEFAULT 1,
    FOREIGN KEY (planejamento_id) REFERENCES planejamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
);

-- =======================================================
-- 5. AVALIAÇÕES E REGISTROS ESPECÍFICOS [cite: 12, 13, 14, 17, 18, 22, 27]
-- =======================================================

CREATE TABLE registros_conquista_infantil (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricula_id INT NOT NULL,
    mes INT NOT NULL, -- Registro mensal 
    descricao_conquista TEXT NOT NULL,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
);

CREATE TABLE avaliacoes_desempenho (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricula_id INT NOT NULL,
    turma_disciplina_id INT NOT NULL,
    periodo ENUM('1_Bimestre', '2_Bimestre', '3_Bimestre', '4_Bimestre', '1_Semestre', '2_Semestre', 'Inicial', 'Final'), [cite: 13, 14, 18]
    tipo ENUM('Nota', 'Conceito', 'Parecer_Descritivo') NOT NULL, [cite: 13, 14, 17, 18, 22, 27]
    valor_nota DECIMAL(4,2),
    valor_conceito VARCHAR(50),
    texto_parecer TEXT,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id) ON DELETE CASCADE
);