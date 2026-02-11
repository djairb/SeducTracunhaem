-- =======================================================
-- 1. CONFIGURAÇÃO E HIERARQUIA INICIAL
-- =======================================================
DROP DATABASE IF EXISTS sys_seduc_municipal;
CREATE DATABASE sys_seduc_municipal;
USE sys_seduc_municipal;

-- 1.1 Tabela de Escolas (Base de tudo)
CREATE TABLE escolas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    inep VARCHAR(20) UNIQUE,
    endereco VARCHAR(255),
    cep VARCHAR(9),
    ativo BOOLEAN DEFAULT TRUE
);

-- 1.2 Tabela Mãe de Pessoas (Aproveitada da estrutura anterior)
CREATE TABLE pessoas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    nome_mae VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    telefone_celular VARCHAR(20),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- 2. ACESSOS E PERFIS [cite: 1, 6, 9]
-- =======================================================

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Master', 'Coordenacao', 'Secretaria', 'Professor') NOT NULL,
    pessoa_id INT NULL,
    escola_id INT NULL, -- Vincula coordenadores e secretários a uma unidade
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE SET NULL,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE SET NULL
);

-- =======================================================
-- 3. ATORES ACADÊMICOS (Com vínculo por escola)
-- =======================================================

CREATE TABLE professores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id INT NOT NULL,
    escola_id INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE
);

CREATE TABLE alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id INT NOT NULL,
    escola_id INT NOT NULL,
    matricula_geral VARCHAR(20) UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE
);

-- =======================================================
-- 4. MATRIZ CURRICULAR E TURMAS [cite: 1, 2, 7]
-- =======================================================

CREATE TABLE disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    nivel_ensino ENUM('Infantil', 'Iniciais', 'Finais') NOT NULL
);

CREATE TABLE turmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    escola_id INT NOT NULL,
    nome VARCHAR(50) NOT NULL, -- Ex: 6º Ano A
    ano_letivo INT NOT NULL,
    nivel_ensino ENUM('Infantil', 'Iniciais', 'Finais') NOT NULL,
    FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE
);

-- Vínculo de Matriz (Quais disciplinas a turma tem)
CREATE TABLE turma_disciplinas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    professor_id INT NOT NULL, -- Alocação direta do professor na matéria da turma
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
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
-- 5. DIÁRIO DE CLASSE E PLANEJAMENTO (O coração do sistema) [cite: 11, 16, 21, 25]
-- =======================================================

CREATE TABLE planejamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_disciplina_id INT NOT NULL,
    data_aula DATE NOT NULL,
    conteudo TEXT,
    metodologia TEXT,
    objetivos_aprendizagem TEXT,
    -- Campos específicos por nível (Siedeweb)
    registro_vivencia TEXT, -- Infantil
    proposta_desenvolvimento TEXT, -- Infantil
    organizacao_tempo_espaco TEXT, -- Infantil
    unidade_tematica TEXT, -- Fundamental
    competencias_bncc TEXT, -- Fundamental
    atividades_casa TEXT, -- Fundamental
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id) ON DELETE CASCADE
);

CREATE TABLE frequencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    planejamento_id INT NOT NULL,
    matricula_id INT NOT NULL,
    status ENUM('Presente', 'Ausente', 'Justificado') NOT NULL,
    FOREIGN KEY (planejamento_id) REFERENCES planejamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
);

-- =======================================================
-- 6. AVALIAÇÃO (Notas, Conceitos e Pareceres) [cite: 13, 14, 17, 18, 22, 26]
-- =======================================================

CREATE TABLE avaliacoes_desempenho (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricula_id INT NOT NULL,
    turma_disciplina_id INT NOT NULL,
    periodo ENUM('1_Bimestre', '2_Bimestre', '3_Bimestre', '4_Bimestre', '1_Semestre', '2_Semestre', 'Final'),
    tipo ENUM('Nota', 'Conceito', 'Parecer_Descritivo') NOT NULL,
    valor_nota DECIMAL(4,2),
    valor_conceito VARCHAR(50),
    texto_parecer TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_disciplina_id) REFERENCES turma_disciplinas(id) ON DELETE CASCADE
);

-- =======================================================
-- 7. SEED: DISCIPLINAS PADRONIZADAS DA SECRETARIA
-- =======================================================

-- Infantil
INSERT INTO disciplinas (nome, nivel_ensino) VALUES 
('Polivalente', 'Infantil'), ('O Eu, O Outro e Nós', 'Infantil'), 
('Escuta, Fala, Pensamento e Imaginação', 'Infantil'), ('Traços, Sons, Cores e Formas', 'Infantil'),
('Espacos, Tempos, Quantidades, Relações e Transformações', 'Infantil');

-- Anos Iniciais
INSERT INTO disciplinas (nome, nivel_ensino) VALUES 
('Educação Física', 'Iniciais'), ('Ligua/Literatura Portuguesa', 'Iniciais'),
('História', 'Iniciais'), ('Geografia', 'Iniciais'), ('Ensino Religioso', 'Iniciais'),
('Matemática', 'Iniciais'), ('Ciências', 'Iniciais'), ('Arte', 'Iniciais'),
('Polivalente', 'Iniciais'), ('Aspectos Atitudinais', 'Iniciais');

-- Anos Finais
INSERT INTO disciplinas (nome, nivel_ensino) VALUES 
('Lingua/Literatura Estrangeira Inglês', 'Finais'), ('Arte', 'Finais'),
('Educação Física', 'Finais'), ('Lingua/Literatura Portuguesa', 'Finais'),
('História', 'Finais'), ('Matemática', 'Finais'), ('Geografia', 'Finais'),
('Ensino Religioso', 'Finais'), ('Ciências', 'Finais');