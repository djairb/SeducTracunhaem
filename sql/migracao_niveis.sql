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
