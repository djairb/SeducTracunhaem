const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const app = express();
const PORT = 3001;

// ==========================================
// CONFIGURAÇÃO DE CORS (LOCAL E PRODUÇÃO)
// ==========================================
app.use((req, res, next) => {
    // Lista de quem pode acessar sua API
    const allowedOrigins = [
        'http://localhost:5173',          // Seu Front Local (Vite)
        'http://localhost:3000',          // Se usar Create React App
        'http://127.0.0.1:5173',          // Variação do localhost
        'https://somosconexaosocial.org'  // Seu site em produção (pra garantir)
    ];

    const origin = req.headers.origin;

    // Se quem chamou está na lista, a gente responde: "Pode entrar!"
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    // Métodos permitidos (Adicionei PATCH que vi no seu código)
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    
    // Headers permitidos (Token, JSON, etc)
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    // Permite cookies e credenciais (Isso que resolve o problema do login!)
    res.header("Access-Control-Allow-Credentials", "true");

    // Se for só uma pergunta do navegador (OPTIONS), responde OK e encerra
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});
app.use(express.json());

// --- CONEXÃO COM O BANCO ---
const db_esc_tec = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Karolinne10", // Sua senha
    database: "sys_escola_tecnica", // O banco novo
    multipleStatements: true // Permite rodar mais de uma query se precisar
});

// Teste de Conexão
db_esc_tec.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Erro ao conectar no MySQL:", err.code);
    } else {
        console.log("✅ Backend rodando e conectado ao MySQL!");
        connection.release();
    }
});

// ==========================================
//                 ROTAS
// ==========================================

app.get("/escola_tecnica/", (req, res) => {
    res.send("API Conectiva Online 🚀");
});

// --- ROTA 1: CADASTRAR ALUNO (TRANSAÇÃO COMPLETA) ---
app.post("/escola_tecnica/alunos", (req, res) => {
    const dados = req.body;

    // Pega uma conexão exclusiva do pool para garantir a transação
    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro ao obter conexão com banco." });

        // 1. Inicia a Transação
        conn.beginTransaction(async (err) => {
            if (err) {
                conn.release();
                return res.status(500).json({ error: "Erro ao iniciar transação." });
            }

            try {
                // 2. Inserir na tabela PESSOAS
                const sqlPessoa = `
                    INSERT INTO pessoas (
                        nome_completo, nome_social, sexo, data_nascimento, escolaridade,
                        nome_mae, nome_pai,
                        cpf, rg, rg_orgao_emissor, rg_uf_emissor,
                        cep, endereco, numero, bairro, cidade, estado,
                        telefone_celular, telefone_emergencia, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const valuesPessoa = [
                    dados.nome_completo, dados.nome_social, dados.sexo, dados.data_nascimento, dados.escolaridade,
                    dados.nome_mae, dados.nome_pai,
                    dados.cpf, dados.rg, dados.rg_orgao, dados.rg_uf, // Note que no front tem que mandar com esses nomes
                    dados.cep, dados.endereco, dados.numero, dados.bairro, dados.cidade, dados.estado,
                    dados.telefone_celular, dados.telefone_emergencia, dados.email
                ];

                // Executa Query 1 (Pessoa)
                const resultPessoa = await new Promise((resolve, reject) => {
                    conn.query(sqlPessoa, valuesPessoa, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                const novaPessoaId = resultPessoa.insertId; // ID gerado para a pessoa

                // 3. Gerar Matrícula (Lógica: AnoAtual + ID da Pessoa. Ex: 202615)
                const anoAtual = new Date().getFullYear();
                const matriculaGerada = `${anoAtual}${novaPessoaId}`;

                // 4. Inserir na tabela ALUNOS
                const sqlAluno = `
                    INSERT INTO alunos (pessoa_id, matricula, status_financeiro, ativo)
                    VALUES (?, ?, 'Em dia', true)
                `;

                // Executa Query 2 (Aluno)
                await new Promise((resolve, reject) => {
                    conn.query(sqlAluno, [novaPessoaId, matriculaGerada], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                // 5. Sucesso Total: COMMIT (Salva de verdade)
                conn.commit((err) => {
                    if (err) {
                        return conn.rollback(() => {
                            conn.release();
                            res.status(500).json({ error: "Erro ao finalizar cadastro." });
                        });
                    }

                    conn.release(); // Libera a conexão
                    res.status(201).json({
                        message: "Aluno matriculado com sucesso!",
                        matricula: matriculaGerada,
                        nome: dados.nome_completo
                    });
                });

            } catch (error) {
                // Se der qualquer erro no caminho: ROLLBACK (Desfaz tudo)
                conn.rollback(() => {
                    conn.release();
                    console.error("Erro no cadastro:", error);

                    // Tratamento de erro específico (ex: CPF duplicado)
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: "CPF ou RG já cadastrado no sistema!" });
                    }

                    res.status(500).json({ error: "Erro interno ao salvar dados." });
                });
            }
        });
    });
});

// --- ROTA 2: LISTAR ALUNOS (Para a tabela futura) ---
// --- ROTA 2: LISTAR ALUNOS ---
app.get("/escola_tecnica/alunos", (req, res) => {
    const sql = `
        SELECT 
            al.id, 
            al.matricula, 
            al.status_financeiro, 
            al.ativo,
            pe.nome_completo, 
            pe.email, 
            pe.telefone_celular, 
            pe.cpf,
            pe.data_nascimento, -- <--- ADICIONEI
            pe.sexo             -- <--- ADICIONEI
        FROM alunos al
        INNER JOIN pessoas pe ON al.pessoa_id = pe.id
        ORDER BY pe.nome_completo ASC
    `;

    db_esc_tec.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar alunos." });
        res.json(results);
    });
});


// ... (resto do código de conexão igual) ...

// --- ROTA DE LOGIN SEGURA ---
app.post("/escola_tecnica/login", (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ? AND ativo = 1";
    

    db_esc_tec.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno no servidor." });

        if (results.length === 0) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        const usuario = results[0];

        // 1. Validação da Senha (BCRYPT)
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        // 2. Lógica de Perfis (A novidade!)
        let professorId = null;
        let redirectPath = '/'; // Padrão: vai para o dashboard admin

        // Se for PROFESSOR, precisamos descobrir o ID dele na tabela 'professores'
        if (usuario.perfil === 'Professor') {
            if (!usuario.pessoa_id) {
                return res.status(400).json({ error: "Erro: Usuário professor sem vínculo com pessoa." });
            }

            // --- AQUI ESTÁ A MUDANÇA ---
            // Além do ID, buscamos também o nome_completo na tabela 'pessoas'
            const sqlProf = `
                SELECT pr.id as prof_id, p.nome_completo 
                FROM professores pr
                INNER JOIN pessoas p ON pr.pessoa_id = p.id
                WHERE pr.pessoa_id = ?
            `;
            
            try {
                const dadosProf = await new Promise((resolve, reject) => {
                    db_esc_tec.query(sqlProf, [usuario.pessoa_id], (e, r) => e ? reject(e) : resolve(r));
                });

                if (dadosProf.length > 0) {
                    professorId = dadosProf[0].prof_id;
                    
                    // TRUQUE DE MESTRE: 
                    // Sobrescrevemos o nome do usuário (login) pelo nome oficial da pessoa
                    usuario.nome = dadosProf[0].nome_completo; 
                    
                    redirectPath = '/portal-professor';
                } else {
                    return res.status(400).json({ error: "Cadastro de professor não encontrado." });
                }
            } catch (e) {
                return res.status(500).json({ error: "Erro ao vincular dados." });
            }
        }
        // Se for Aluno (Futuro)
        else if (usuario.perfil === 'Aluno') {
            redirectPath = '/portal-aluno';
        }

        // 3. Gerar o Token (O Crachá Digital)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                perfil: usuario.perfil, 
                professorId: professorId, // Vai ser NULL se for Admin, e numérico se for Prof
                nome: usuario.nome
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: '12h' }
        );

        // 4. Retornar tudo pro Frontend
        res.json({
            message: "Login realizado!",
            token: token,           // O Front guarda isso
            redirectPath: redirectPath, // O Front usa isso pra navegar
            user: {                 // Dados para exibir na tela
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                professorId: professorId
            }
        });
    });
});


// --- ROTA 3: BUSCAR UM ALUNO PELO ID (Para Edição) ---
app.get("/escola_tecnica/alunos/:id", (req, res) => {
    const sql = `
        SELECT 
            al.id as aluno_id,
            pe.* -- Traz tudo da tabela pessoas
        FROM alunos al
        INNER JOIN pessoas pe ON al.pessoa_id = pe.id
        WHERE al.id = ?
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar dados." });
        if (results.length === 0) return res.status(404).json({ error: "Aluno não encontrado." });

        // Ajuste pequeno nos nomes dos campos pra bater com o formulário React
        const dados = results[0];
        // O front espera "rg_orgao" mas no banco tá "rg_orgao_emissor" (se tiver diferente, ajusta aqui)
        dados.rg_orgao = dados.rg_orgao_emissor;
        dados.rg_uf = dados.rg_uf_emissor;

        res.json(dados);
    });
});

// --- ROTA 4: ATUALIZAR ALUNO (PUT) ---
app.put("/escola_tecnica/alunos/:id", (req, res) => {
    const idAluno = req.params.id;
    const dados = req.body;

    // Precisamos achar o ID da Pessoa ligado a esse Aluno
    const sqlBuscaPessoa = "SELECT pessoa_id FROM alunos WHERE id = ?";

    db_esc_tec.query(sqlBuscaPessoa, [idAluno], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: "Aluno não encontrado." });

        const idPessoa = results[0].pessoa_id;

        // Atualiza a tabela PESSOAS
        const sqlUpdate = `
            UPDATE pessoas SET
                nome_completo = ?, nome_social = ?, sexo = ?, data_nascimento = ?, escolaridade = ?,
                nome_mae = ?, nome_pai = ?,
                cpf = ?, rg = ?, rg_orgao_emissor = ?, rg_uf_emissor = ?,
                cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?,
                telefone_celular = ?, email = ?
            WHERE id = ?
        `;

        const values = [
            dados.nome_completo, dados.nome_social, dados.sexo, dados.data_nascimento, dados.escolaridade,
            dados.nome_mae, dados.nome_pai,
            dados.cpf, dados.rg, dados.rg_orgao, dados.rg_uf, // Atenção aos nomes vindos do front
            dados.cep, dados.endereco, dados.numero, dados.bairro, dados.cidade, dados.estado,
            dados.telefone_celular, dados.email,
            idPessoa // WHERE id = ?
        ];

        db_esc_tec.query(sqlUpdate, values, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro ao atualizar dados." });
            }
            res.json({ message: "Dados atualizados com sucesso!" });
        });
    });
});

// --- ROTA 5: DELETAR ALUNO (SEM DEIXAR RASTRO) ---
app.delete("/escola_tecnica/alunos/:id", (req, res) => {
    const idAluno = req.params.id;

    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro de conexão." });

        conn.beginTransaction(async (err) => {
            if (err) { conn.release(); return res.status(500).json({ error: "Erro ao iniciar." }); }

            try {
                // 1. Descobrir o ID da Pessoa antes de deletar o aluno
                const sqlBusca = "SELECT pessoa_id FROM alunos WHERE id = ?";
                const resultados = await new Promise((resolve, reject) => {
                    conn.query(sqlBusca, [idAluno], (err, res) => err ? reject(err) : resolve(res));
                });

                if (resultados.length === 0) {
                    throw new Error("Aluno não encontrado.");
                }

                const idPessoa = resultados[0].pessoa_id;

                // 2. Deletar da tabela ALUNOS
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM alunos WHERE id = ?", [idAluno], (err, res) => err ? reject(err) : resolve(res));
                });

                // 3. Deletar da tabela PESSOAS (Faxina completa)
                // Nota: Se essa pessoa for também um Professor ou Usuário, o banco vai bloquear (o que é seguro!)
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM pessoas WHERE id = ?", [idPessoa], (err, res) => err ? reject(err) : resolve(res));
                });

                conn.commit(() => {
                    conn.release();
                    res.json({ message: "Aluno e dados pessoais excluídos com sucesso!" });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    console.error(error);
                    // Se o erro for de chave estrangeira (ex: aluno tem notas/faltas)
                    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                        res.status(409).json({ error: "Não é possível excluir: Este aluno possui matrículas ou registros acadêmicos vinculados." });
                    } else {
                        res.status(500).json({ error: "Erro ao excluir aluno." });
                    }
                });
            }
        });
    });
});

// --- ROTA 6: DADOS DO DASHBOARD (RESUMO) ---
// --- ROTA 6: DADOS COMPLETOS DO DASHBOARD ---
// ROTA DASHBOARD ATUALIZADA (Com novos gráficos)
app.get("/escola_tecnica/dashboard-resumo", async (req, res) => {
    console.log("--- INICIANDO DASHBOARD ---");
    try {
        const [alunosRes, turmasRes, profsRes, aulasRes, dadosDemograficos, dadosStatus, dadosDesempenho] = await Promise.all([
            // 1. Cards
            new Promise((resolve, reject) => db_esc_tec.query("SELECT COUNT(*) as total FROM alunos WHERE ativo = 1", (e, r) => e ? reject(e) : resolve(r))),
            new Promise((resolve, reject) => db_esc_tec.query("SELECT COUNT(*) as total FROM turmas WHERE ativa = 1", (e, r) => e ? reject(e) : resolve(r))),
            new Promise((resolve, reject) => db_esc_tec.query("SELECT COUNT(*) as total FROM professores WHERE ativo = 1", (e, r) => e ? reject(e) : resolve(r))),
            new Promise((resolve, reject) => db_esc_tec.query("SELECT COUNT(*) as total FROM aulas", (e, r) => e ? reject(e) : resolve(r))),

            // 2. Demografia
            new Promise((resolve, reject) => {
                const sql = "SELECT p.sexo, p.data_nascimento FROM pessoas p INNER JOIN alunos a ON p.id = a.pessoa_id WHERE a.ativo = 1";
                db_esc_tec.query(sql, (e, r) => e ? reject(e) : resolve(r));
            }),

            // 3. Status Global
            new Promise((resolve, reject) => {
                const sql = "SELECT status, COUNT(*) as total FROM frequencias GROUP BY status";
                db_esc_tec.query(sql, (e, r) => e ? reject(e) : resolve(r));
            }),

            // 4. Desempenho Turmas (Query Blindada)
            new Promise((resolve, reject) => {
                const sql = `
                    SELECT 
                        t.codigo as turma,
                        COALESCE(SUM(CASE WHEN f.status IN ('Presente', 'Justificado') THEN 1 ELSE 0 END), 0) as comparecimento,
                        COUNT(f.id) as total_registros
                    FROM turmas t
                    LEFT JOIN turma_disciplinas td ON t.id = td.turma_id
                    LEFT JOIN aulas a ON td.id = a.turma_disciplina_id
                    LEFT JOIN frequencias f ON a.id = f.aula_id
                    WHERE t.ativa = 1
                    GROUP BY t.id, t.codigo
                    ORDER BY t.codigo ASC
                `;
                db_esc_tec.query(sql, (e, r) => e ? reject(e) : resolve(r));
            })
        ]);

        // --- DEBUG NO TERMINAL ---
        console.log("DADOS STATUS (Raw):", dadosStatus);
        console.log("DADOS TURMAS (Raw):", dadosDesempenho);

        // Processamento
        const sexoMap = { Masculino: 0, Feminino: 0, Outro: 0 };
        const idadeMap = {}; 
        dadosDemograficos.forEach(dado => {
            if (sexoMap[dado.sexo] !== undefined) sexoMap[dado.sexo]++;
            if (dado.data_nascimento) {
                const hoje = new Date();
                const nasc = new Date(dado.data_nascimento);
                let idade = hoje.getFullYear() - nasc.getFullYear();
                const m = hoje.getMonth() - nasc.getMonth();
                if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
                const label = `${idade} anos`;
                idadeMap[label] = (idadeMap[label] || 0) + 1;
            }
        });

        const statusMap = { Presente: 0, Ausente: 0, Justificado: 0 };
        dadosStatus.forEach(d => {
            if (statusMap[d.status] !== undefined) statusMap[d.status] = d.total;
        });
        const graficoStatus = [
            { name: 'Presença', value: statusMap.Presente },
            { name: 'Faltas', value: statusMap.Ausente },
            { name: 'Justif.', value: statusMap.Justificado }
        ].filter(i => i.value > 0);

        const graficoTurmas = dadosDesempenho.map(d => ({
            name: d.turma,
            percentual: d.total_registros > 0 ? parseFloat(((d.comparecimento / d.total_registros) * 100).toFixed(1)) : 0
        }));
        
        console.log("TURMAS PROCESSADO:", graficoTurmas);

        res.json({
            cards: {
                total_alunos: alunosRes[0].total,
                total_turmas: turmasRes[0].total,
                total_professores: profsRes[0].total,
                total_aulas: aulasRes[0].total
            },
            graficos: {
                sexo: [
                    { name: 'Masculino', value: sexoMap.Masculino },
                    { name: 'Feminino', value: sexoMap.Feminino },
                    { name: 'Outro', value: sexoMap.Outro },
                ].filter(i => i.value > 0),
                idade: Object.keys(idadeMap).map(key => ({ name: key, alunos: idadeMap[key] })).sort((a, b) => parseInt(a.name) - parseInt(b.name)),
                status: graficoStatus,
                turmas: graficoTurmas
            }
        });

    } catch (error) {
        console.error("ERRO FATAL DASHBOARD:", error);
        res.status(500).json({ error: "Erro ao carregar dados." });
    }
});

// --- ROTA UTILITÁRIA (SÓ PRA GERAR HASH) ---
// Use isso pra pegar o código da senha '123456' e atualizar no seu banco manualmente
app.get("/escola_tecnica/gerar-hash/:senha", async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.params.senha, salt);
    res.json({ senha_original: req.params.senha, hash_para_o_banco: hash });
});


// ==========================================
//           ROTAS DE PROFESSORES
// ==========================================

// --- 1. CADASTRAR PROFESSOR (TRANSAÇÃO) ---
app.post("/escola_tecnica/professores", (req, res) => {
    const dados = req.body;

    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro de conexão." });

        conn.beginTransaction(async (err) => {
            if (err) { conn.release(); return res.status(500).json({ error: "Erro transação." }); }

            try {
                // 1. Inserir PESSOA
                const sqlPessoa = `
                    INSERT INTO pessoas (
                        nome_completo, nome_social, sexo, data_nascimento, escolaridade,
                        nome_mae, nome_pai,
                        cpf, rg, rg_orgao_emissor, rg_uf_emissor,
                        cep, endereco, numero, bairro, cidade, estado,
                        telefone_celular, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const valuesPessoa = [
                    dados.nome_completo, dados.nome_social, dados.sexo, dados.data_nascimento, dados.escolaridade,
                    dados.nome_mae, dados.nome_pai,
                    dados.cpf, dados.rg, dados.rg_orgao, dados.rg_uf,
                    dados.cep, dados.endereco, dados.numero, dados.bairro, dados.cidade, dados.estado,
                    dados.telefone_celular, dados.email
                ];

                const resultPessoa = await new Promise((resolve, reject) => {
                    conn.query(sqlPessoa, valuesPessoa, (err, res) => err ? reject(err) : resolve(res));
                });

                const novaPessoaId = resultPessoa.insertId;

                // 2. Inserir PROFESSOR (Dados Específicos)
                const sqlProf = `
                    INSERT INTO professores (
                        pessoa_id, conselho_tipo, conselho_numero, conselho_uf, data_contratacao, ativo
                    ) VALUES (?, ?, ?, ?, ?, true)
                `;

                // Tratando a data de contratação (Se não vier, usa hoje)
                const dataContratacao = dados.data_contratacao || new Date();

                await new Promise((resolve, reject) => {
                    conn.query(sqlProf, [novaPessoaId, dados.conselho_tipo, dados.conselho_numero, dados.conselho_uf, dataContratacao], (err, res) => err ? reject(err) : resolve(res));
                });

                conn.commit(() => {
                    conn.release();
                    res.status(201).json({ message: "Professor cadastrado com sucesso!" });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    console.error("Erro ao cadastrar professor:", error);
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: "CPF já cadastrado no sistema!" });
                    }
                    res.status(500).json({ error: "Erro interno ao salvar." });
                });
            }
        });
    });
});

// --- 2. LISTAR PROFESSORES ---
app.get("/escola_tecnica/professores", (req, res) => {
    const sql = `
        SELECT 
            pr.id, 
            pr.conselho_tipo, 
            pr.conselho_numero, 
            pr.conselho_uf,
            pr.data_contratacao, 
            pr.ativo,
            pe.nome_completo, 
            pe.email, 
            pe.telefone_celular, 
            pe.cpf,            
            pe.data_nascimento -- Pra calcular idade se quiser
        FROM professores pr
        INNER JOIN pessoas pe ON pr.pessoa_id = pe.id
        ORDER BY pe.nome_completo ASC
    `;

    db_esc_tec.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar professores." });
        res.json(results);
    });
});

// --- 3. BUSCAR UM PROFESSOR (Para Edição) ---
app.get("/escola_tecnica/professores/:id", (req, res) => {
    const sql = `
        SELECT 
            pr.id as professor_id,
            pr.conselho_tipo, pr.conselho_numero, pr.conselho_uf, pr.data_contratacao,
            pe.* FROM professores pr
        INNER JOIN pessoas pe ON pr.pessoa_id = pe.id
        WHERE pr.id = ?
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno." });
        if (results.length === 0) return res.status(404).json({ error: "Professor não encontrado." });

        // Ajustes de nomes de campo se necessário
        const dados = results[0];
        dados.rg_orgao = dados.rg_orgao_emissor;
        dados.rg_uf = dados.rg_uf_emissor;

        res.json(dados);
    });
});

// --- 4. ATUALIZAR PROFESSOR (PUT) ---
app.put("/escola_tecnica/professores/:id", (req, res) => {
    const idProfessor = req.params.id;
    const dados = req.body;

    // Achar ID da Pessoa
    db_esc_tec.query("SELECT pessoa_id FROM professores WHERE id = ?", [idProfessor], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "Não encontrado." });
        const idPessoa = results[0].pessoa_id;

        // Atualiza Pessoa
        const sqlPessoa = `
            UPDATE pessoas SET
                nome_completo=?, nome_social=?, sexo=?, data_nascimento=?, escolaridade=?,
                nome_mae=?, nome_pai=?, cpf=?, rg=?, rg_orgao_emissor=?, rg_uf_emissor=?,
                cep=?, endereco=?, numero=?, bairro=?, cidade=?, estado=?,
                telefone_celular=?, email=?
            WHERE id=?
        `;
        const valuesPessoa = [
            dados.nome_completo, dados.nome_social, dados.sexo, dados.data_nascimento, dados.escolaridade,
            dados.nome_mae, dados.nome_pai, dados.cpf, dados.rg, dados.rg_orgao, dados.rg_uf,
            dados.cep, dados.endereco, dados.numero, dados.bairro, dados.cidade, dados.estado,
            dados.telefone_celular, dados.email,
            idPessoa
        ];

        // Atualiza Professor
        const sqlProf = `
            UPDATE professores SET
                conselho_tipo=?, conselho_numero=?, conselho_uf=?, data_contratacao=?
            WHERE id=?
        `;
        const valuesProf = [
            dados.conselho_tipo, dados.conselho_numero, dados.conselho_uf, dados.data_contratacao,
            idProfessor
        ];

        // Executa em sequência (ideal seria transação, mas simplifiquei aqui pq update é menos arriscado)
        db_esc_tec.query(sqlPessoa, valuesPessoa, (err) => {
            if (err) return res.status(500).json({ error: "Erro ao atualizar dados pessoais." });

            db_esc_tec.query(sqlProf, valuesProf, (err) => {
                if (err) return res.status(500).json({ error: "Erro ao atualizar dados profissionais." });
                res.json({ message: "Professor atualizado!" });
            });
        });
    });
});

// --- 5. DELETAR PROFESSOR (COM SEGURANÇA) ---
app.delete("/escola_tecnica/professores/:id", (req, res) => {
    const idProf = req.params.id;

    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro conexão." });

        conn.beginTransaction(async (err) => {
            try {
                // Pega o ID da pessoa
                const resBusca = await new Promise((resolve, reject) => {
                    conn.query("SELECT pessoa_id FROM professores WHERE id=?", [idProf], (e, r) => e ? reject(e) : resolve(r));
                });
                if (resBusca.length === 0) throw new Error("Não encontrado");
                const idPessoa = resBusca[0].pessoa_id;

                // Deleta Professor
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM professores WHERE id=?", [idProf], (e, r) => e ? reject(e) : resolve(r));
                });

                // Deleta Pessoa
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM pessoas WHERE id=?", [idPessoa], (e, r) => e ? reject(e) : resolve(r));
                });

                conn.commit(() => {
                    conn.release();
                    res.json({ message: "Professor excluído." });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    // Erro de Foreign Key (Se ele já der aula)
                    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                        return res.status(409).json({ error: "Não é possível excluir: Professor já vinculado a turmas ou aulas." });
                    }
                    res.status(500).json({ error: "Erro ao excluir." });
                });
            }
        });
    });
});

// 18.01.2026

// ==========================================
//           ROTAS ACADÊMICAS (DISCIPLINAS) - 18.01.2026
// ==========================================

// --- 1. LISTAR CURSOS (Pra preencher o select, se tiver mais de um) ---
app.get("/escola_tecnica/cursos", (req, res) => {
    db_esc_tec.query("SELECT * FROM cursos WHERE ativo = 1", (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar cursos." });
        res.json(results);
    });
});

// --- 2. LISTAR DISCIPLINAS ---
app.get("/escola_tecnica/disciplinas", (req, res) => {
    const sql = `
        SELECT d.*, c.nome as nome_curso 
        FROM disciplinas d
        INNER JOIN cursos c ON d.curso_id = c.id
        ORDER BY d.nome ASC
    `;
    db_esc_tec.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar disciplinas." });
        res.json(results);
    });
});

// --- 3. CADASTRAR DISCIPLINA ---
app.post("/escola_tecnica/disciplinas", (req, res) => {
    const { curso_id, nome, carga_horaria } = req.body;

    if (!nome || !curso_id) return res.status(400).json({ error: "Nome e Curso são obrigatórios." });

    const sql = "INSERT INTO disciplinas (curso_id, nome, carga_horaria) VALUES (?, ?, ?)";
    db_esc_tec.query(sql, [curso_id, nome, carga_horaria], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao salvar disciplina." });
        res.status(201).json({ message: "Disciplina criada!", id: result.insertId });
    });
});

// --- 4. EXCLUIR DISCIPLINA ---
app.delete("/escola_tecnica/disciplinas/:id", (req, res) => {
    db_esc_tec.query("DELETE FROM disciplinas WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            // Se der erro FK (estiver sendo usada em turma), avisa
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ error: "Disciplina já está em uso em alguma turma." });
            }
            return res.status(500).json({ error: "Erro ao excluir." });
        }
        res.json({ message: "Disciplina removida." });
    });
});

// ==========================================
//           ROTAS DE TURMAS
// ==========================================

// --- 1. LISTAR TURMAS (Com contagem de alunos) ---
app.get("/escola_tecnica/turmas", (req, res) => {
    const sql = `
        SELECT 
            t.*, 
            c.nome as nome_curso,
            (SELECT COUNT(*) FROM matriculas m WHERE m.turma_id = t.id AND m.status = 'Ativo') as total_alunos
        FROM turmas t
        INNER JOIN cursos c ON t.curso_id = c.id
        ORDER BY t.id DESC
    `;
    db_esc_tec.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar turmas." });
        res.json(results);
    });
});

// --- 2. CRIAR TURMA ---
app.post("/escola_tecnica/turmas", (req, res) => {
    const data = req.body;

    // Gera um código automático se não vier (Ex: 2026.1-MANHA)
    const codigoGerado = data.codigo || `${data.periodo}-${data.turno.toUpperCase().substring(0, 3)}`;

    const sql = `
        INSERT INTO turmas (curso_id, codigo, periodo, turno, data_inicio, data_fim, ativa)
        VALUES (?, ?, ?, ?, ?, ?, true)
    `;

    const values = [
        data.curso_id, codigoGerado, data.periodo, data.turno,
        data.data_inicio, data.data_fim
    ];

    db_esc_tec.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao criar turma." });
        res.status(201).json({ message: "Turma criada com sucesso!", id: result.insertId });
    });
});

// --- 3. EXCLUIR TURMA ---
app.delete("/escola_tecnica/turmas/:id", (req, res) => {
    db_esc_tec.query("DELETE FROM turmas WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            // Se o erro for de Integridade Referencial (Tem filhos vinculados)
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ 
                    error: "Não é possível excluir esta turma pois existem registros vinculados (Alunos, Professores ou Aulas). Remova os vínculos primeiro ou encerre a turma." 
                });
            }
            // Outro erro qualquer
            return res.status(500).json({ error: "Erro interno ao tentar excluir a turma." });
        }
        res.json({ message: "Turma removida com sucesso." });
    });
});




// ---------------------------

// ==========================================
//        ROTAS DE GESTÃO DA TURMA (COCKPIT)
// ==========================================

// 1. DETALHES DA TURMA (Cabeçalho)
app.get("/escola_tecnica/turmas/:id", (req, res) => {
    const sql = `
        SELECT t.*, c.nome as nome_curso 
        FROM turmas t 
        INNER JOIN cursos c ON t.curso_id = c.id 
        WHERE t.id = ?
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: "Turma não encontrada." });
        res.json(results[0]);
    });
});

// 2. LISTAR DISCIPLINAS DA TURMA (Grade)
app.get("/escola_tecnica/turmas/:id/disciplinas", (req, res) => {
    const sql = `
        SELECT td.id, td.disciplina_id, d.nome, d.carga_horaria 
        FROM turma_disciplinas td
        INNER JOIN disciplinas d ON td.disciplina_id = d.id
        WHERE td.turma_id = ?
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar grade." });
        res.json(results);
    });
});

app.delete("/escola_tecnica/turmas/disciplinas/:id", (req, res) => {
    const idTurmaDisciplina = req.params.id;
    
    // OBS: O banco vai reclamar se já tiver aula lançada pra essa matéria nessa turma.
    // Isso é bom! Evita que a coordenação apague uma matéria que já está em andamento.
    const sql = "DELETE FROM turma_disciplinas WHERE id = ?";
    
    db_esc_tec.query(sql, [idTurmaDisciplina], (err) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ error: "Não é possível remover: Já existem aulas ou professores vinculados a esta disciplina nesta turma." });
            }
            return res.status(500).json({ error: "Erro ao remover disciplina." });
        }
        res.json({ message: "Disciplina removida da grade." });
    });
});

// 3. ADICIONAR DISCIPLINA NA TURMA (POST)
app.post("/escola_tecnica/turmas/:id/disciplinas", (req, res) => {
    const { disciplina_id } = req.body;
    const turma_id = req.params.id;

    const sql = "INSERT INTO turma_disciplinas (turma_id, disciplina_id) VALUES (?, ?)";
    db_esc_tec.query(sql, [turma_id, disciplina_id], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "Disciplina já adicionada nesta turma." });
            return res.status(500).json({ error: "Erro ao adicionar." });
        }
        res.json({ message: "Disciplina adicionada!" });
    });
});

// 4. LISTAR PROFESSORES ALOCADOS
app.get("/escola_tecnica/turmas/:id/professores", (req, res) => {
    // Traz o professor, a matéria que ele dá e se tá ativo
    const sql = `
        SELECT ap.id, ap.ativo, ap.data_inicio, ap.data_fim,
               p.nome_completo, d.nome as disciplina
        FROM alocacao_professores ap
        INNER JOIN turma_disciplinas td ON ap.turma_disciplina_id = td.id
        INNER JOIN disciplinas d ON td.disciplina_id = d.id
        INNER JOIN professores pr ON ap.professor_id = pr.id
        INNER JOIN pessoas p ON pr.pessoa_id = p.id
        WHERE td.turma_id = ?
        ORDER BY ap.ativo DESC, d.nome ASC
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar professores." });
        res.json(results);
    });
});

// 5. ALOCAR PROFESSOR (POST)
app.post("/escola_tecnica/alocacoes", (req, res) => {
    const { turma_disciplina_id, professor_id, data_inicio } = req.body;

    // 1. PRIMEIRO: Verifica se esse professor JÁ ESTÁ alocado e ATIVO nessa matéria
    const sqlCheck = `
        SELECT id FROM alocacao_professores 
        WHERE turma_disciplina_id = ? 
          AND professor_id = ? 
          AND ativo = 1
    `;

    db_esc_tec.query(sqlCheck, [turma_disciplina_id, professor_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno ao verificar duplicidade." });

        // Se o array 'results' tiver algum item, é porque já existe!
        if (results.length > 0) {
            return res.status(409).json({ error: "Este professor já está alocado e ativo nesta disciplina." });
        }

        // 2. SE NÃO EXISTIR: Faz o INSERT normal
        const sqlInsert = "INSERT INTO alocacao_professores (turma_disciplina_id, professor_id, data_inicio) VALUES (?, ?, ?)";
        
        db_esc_tec.query(sqlInsert, [turma_disciplina_id, professor_id, data_inicio], (errInsert) => {
            if (errInsert) return res.status(500).json({ error: "Erro ao alocar professor." });
            res.json({ message: "Professor alocado com sucesso!" });
        });
    });
});

// ==========================================
//          ROTAS DE MATRÍCULA (ALUNOS)
// ==========================================

// 1. LISTAR ALUNOS JÁ MATRICULADOS NA TURMA
app.get("/escola_tecnica/turmas/:id/matriculados", (req, res) => {
    const sql = `
        SELECT m.id as matricula_id, m.data_matricula, m.status,
               a.matricula as numero_matricula,
               p.nome_completo, p.cpf, p.telefone_celular
        FROM matriculas m
        INNER JOIN alunos a ON m.aluno_id = a.id
        INNER JOIN pessoas p ON a.pessoa_id = p.id
        WHERE m.turma_id = ?
        ORDER BY p.nome_completo ASC
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar alunos." });
        res.json(results);
    });
});

// 2. LISTAR ALUNOS DISPONÍVEIS (QUE NÃO ESTÃO NESTA TURMA)
app.get("/escola_tecnica/turmas/:id/disponiveis", (req, res) => {
    // Essa query é ninja: Traz todos os alunos EXCETO os que já estão nessa turma
    const sql = `
        SELECT a.id, a.matricula, p.nome_completo, p.cpf 
        FROM alunos a
        INNER JOIN pessoas p ON a.pessoa_id = p.id
        WHERE a.ativo = 1 
        AND a.id NOT IN (SELECT aluno_id FROM matriculas WHERE turma_id = ?)
        ORDER BY p.nome_completo ASC
    `;
    db_esc_tec.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar disponíveis." });
        res.json(results);
    });
});

// 3. MATRICULAR EM MASSA (RECEBE ARRAY DE IDs)
app.post("/escola_tecnica/turmas/:id/matriculas", (req, res) => {
    const turma_id = req.params.id;
    const { alunos_ids } = req.body; // Ex: [1, 5, 8, 12]

    if (!alunos_ids || alunos_ids.length === 0) {
        return res.status(400).json({ error: "Nenhum aluno selecionado." });
    }

    // Monta o array de arrays para o INSERT múltiplo do MySQL
    // Resultado: [[turma_id, 1], [turma_id, 5], ...]
    const values = alunos_ids.map(aluno_id => [turma_id, aluno_id]);

    const sql = "INSERT INTO matriculas (turma_id, aluno_id) VALUES ?";

    db_esc_tec.query(sql, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao realizar matrículas." });
        }
        res.json({ message: `${result.affectedRows} alunos matriculados com sucesso!` });
    });
});

// 4. REMOVER MATRÍCULA (DESVINCULAR ALUNO)
app.delete("/escola_tecnica/matriculas/:id", (req, res) => {
    db_esc_tec.query("DELETE FROM matriculas WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao remover matrícula." });
        res.json({ message: "Aluno removido da turma." });
    });
});

// 6. DESVINCULAR PROFESSOR (REMOVER ALOCAÇÃO)
app.delete("/escola_tecnica/alocacoes/:id", (req, res) => {
    const idAlocacao = req.params.id;

    // Deleta o vínculo. 
    // OBS: Se ele já tiver dado aula (tabela 'aulas'), o banco pode bloquear por segurança (Foreign Key).
    // Nesse caso, o ideal seria apenas mudar 'ativo' para 0 (Soft Delete), mas vamos tentar o Delete real primeiro.
    const sql = "DELETE FROM alocacao_professores WHERE id = ?";

    db_esc_tec.query(sql, [idAlocacao], (err) => {
        if (err) {
            console.error(err);
            // Se der erro de chave estrangeira (já tem aula lançada), avisamos o front
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ error: "Não é possível remover: Professor já possui aulas registradas nesta turma. Tente desativá-lo." });
            }
            return res.status(500).json({ error: "Erro ao desvincular professor." });
        }
        res.json({ message: "Professor desvinculado com sucesso!" });
    });
});

// 7. ENCERRAR ALOCAÇÃO (MANTÉM HISTÓRICO)
// Usa PATCH porque vamos atualizar apenas o status e a data final
app.patch("/escola_tecnica/alocacoes/:id/encerrar", (req, res) => {
    const idAlocacao = req.params.id;
    const dataFim = new Date(); // Pega data e hora atual do servidor

    // Atualiza para inativo e define a data de saída
    const sql = "UPDATE alocacao_professores SET ativo = 0, data_fim = ? WHERE id = ?";

    db_esc_tec.query(sql, [dataFim, idAlocacao], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao encerrar alocação." });
        res.json({ message: "Professor encerrado nesta turma. Histórico preservado." });
    });
});

// 8. REINTEGRAR PROFESSOR (RETORNO RÁPIDO)
// 8. REINTEGRAR PROFESSOR (COM TRAVA DE DUPLICIDADE)
app.post("/escola_tecnica/alocacoes/:id/reintegrar", (req, res) => {
    const idAntigo = req.params.id;
    const dataInicio = new Date();

    // 1. Busca os dados do registro antigo (histórico)
    const sqlBuscaAntigo = "SELECT turma_disciplina_id, professor_id FROM alocacao_professores WHERE id = ?";

    db_esc_tec.query(sqlBuscaAntigo, [idAntigo], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: "Registro original não encontrado." });

        const { turma_disciplina_id, professor_id } = results[0];

        // 2. VERIFICAÇÃO DE SEGURANÇA:
        // Verifica se ele JÁ ESTÁ ATIVO nessa turma atualmente
        const sqlCheckAtivo = `
            SELECT id FROM alocacao_professores 
            WHERE turma_disciplina_id = ? AND professor_id = ? AND ativo = 1
        `;

        db_esc_tec.query(sqlCheckAtivo, [turma_disciplina_id, professor_id], (errCheck, resultsCheck) => {
            if (errCheck) return res.status(500).json({ error: "Erro na verificação." });

            // SE JÁ TIVER UM ATIVO, BLOQUEIA!
            if (resultsCheck.length > 0) {
                return res.status(409).json({ 
                    error: "Ação bloqueada: Este professor já foi reintegrado e está ativo nesta turma no momento." 
                });
            }

            // 3. SE NÃO TIVER, AÍ SIM CRIA O NOVO
            const sqlInsert = "INSERT INTO alocacao_professores (turma_disciplina_id, professor_id, data_inicio) VALUES (?, ?, ?)";
            
            db_esc_tec.query(sqlInsert, [turma_disciplina_id, professor_id, dataInicio], (errInsert, result) => {
                if (errInsert) return res.status(500).json({ error: "Erro ao reintegrar." });
                res.json({ message: "Professor reintegrado com sucesso!", novoId: result.insertId });
            });
        });
    });
});

// ==========================================
//           ÁREA DO PROFESSOR (PORTAL)
// ==========================================

// 1. LISTAR TURMAS DE UM PROFESSOR ESPECÍFICO (DASHBOARD DO PROF)
app.get("/escola_tecnica/professores/:id/turmas", (req, res) => {
    const idProf = req.params.id;

    const sql = `
        SELECT 
            ap.id as alocacao_id,
            t.id as turma_id,
            t.codigo,
            t.periodo,
            t.turno,
            c.nome as nome_curso,
            d.nome as nome_disciplina,
            d.carga_horaria,
            (SELECT COUNT(*) FROM matriculas m WHERE m.turma_id = t.id AND m.status = 'Ativo') as total_alunos
        FROM alocacao_professores ap
        INNER JOIN turma_disciplinas td ON ap.turma_disciplina_id = td.id
        INNER JOIN turmas t ON td.turma_id = t.id
        INNER JOIN cursos c ON t.curso_id = c.id
        INNER JOIN disciplinas d ON td.disciplina_id = d.id
        WHERE ap.professor_id = ? 
        AND ap.ativo = 1  -- Só traz as turmas ATUAIS
        AND t.ativa = 1   -- Só traz turmas que não fecharam
        ORDER BY t.periodo DESC, t.codigo ASC
    `;

    db_esc_tec.query(sql, [idProf], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar turmas do professor." });
        res.json(results);
    });
});

// ==========================================
//           ROTAS DO DIÁRIO DE CLASSE
// ==========================================

// 1. BUSCAR DADOS DA TURMA E ALUNOS (PARA A CHAMADA)
app.get("/escola_tecnica/diario/:alocacaoId/contexto", (req, res) => {
    const idAlocacao = req.params.alocacaoId;

    // Primeiro, descobrimos a turma e disciplina baseados na alocação
    const sqlTurma = `
        SELECT 
            ap.id as alocacao_id, 
            ap.professor_id,
            td.id as turma_disciplina_id,
            t.id as turma_id,
            t.codigo as nome_turma,
            d.nome as nome_disciplina
        FROM alocacao_professores ap
        INNER JOIN turma_disciplinas td ON ap.turma_disciplina_id = td.id
        INNER JOIN turmas t ON td.turma_id = t.id
        INNER JOIN disciplinas d ON td.disciplina_id = d.id
        WHERE ap.id = ?
    `;

    db_esc_tec.query(sqlTurma, [idAlocacao], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "Vínculo não encontrado." });

        const dadosTurma = results[0];

        // Agora buscamos os alunos matriculados nessa turma
        const sqlAlunos = `
            SELECT 
                m.id as matricula_id, 
                a.matricula, 
                p.nome_completo 
            FROM matriculas m
            INNER JOIN alunos a ON m.aluno_id = a.id
            INNER JOIN pessoas p ON a.pessoa_id = p.id
            WHERE m.turma_id = ? AND m.status = 'Ativo'
            ORDER BY p.nome_completo ASC
        `;

        db_esc_tec.query(sqlAlunos, [dadosTurma.turma_id], (err, alunos) => {
            if (err) return res.status(500).json({ error: "Erro ao buscar alunos." });

            // Retorna tudo junto pro Front montar a tela
            res.json({
                ...dadosTurma,
                alunos: alunos
            });
        });
    });
});

// 2. SALVAR AULA E CHAMADA (TRANSAÇÃO)
app.post("/escola_tecnica/diario/aula", (req, res) => {
    const { turma_disciplina_id, professor_id, data_aula, conteudo, frequencias } = req.body;
    // frequencias é um array: [{ matricula_id: 1, status: 'Presente' }, ...]

    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro de conexão." });

        conn.beginTransaction(async (err) => {
            if (err) { conn.release(); return res.status(500).json({ error: "Erro transação." }); }

            try {
                // 1. Salvar a AULA
                const sqlAula = `
                    INSERT INTO aulas (turma_disciplina_id, professor_id, data_aula, conteudo)
                    VALUES (?, ?, ?, ?)
                `;
                const resultAula = await new Promise((resolve, reject) => {
                    conn.query(sqlAula, [turma_disciplina_id, professor_id, data_aula, conteudo], (e, r) => e ? reject(e) : resolve(r));
                });
                const aulaId = resultAula.insertId;

                // 2. Salvar as FREQUÊNCIAS
                if (frequencias && frequencias.length > 0) {
                    // Agora o array values tem 4 itens: aula, aluno, status, observacao
                    const values = frequencias.map(f => [
                        aulaId,
                        f.matricula_id,
                        f.status,
                        f.observacao || null // Se não tiver obs, manda null
                    ]);

                    // Query atualizada com a coluna observacao
                    const sqlFreq = "INSERT INTO frequencias (aula_id, matricula_id, status, observacao) VALUES ?";

                    await new Promise((resolve, reject) => {
                        conn.query(sqlFreq, [values], (e, r) => e ? reject(e) : resolve(r));
                    });
                }

                conn.commit(() => {
                    conn.release();
                    res.status(201).json({ message: "Aula registrada com sucesso!" });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    console.error(error);
                    res.status(500).json({ error: "Erro ao salvar aula." });
                });
            }
        });
    });
});

// 10. CARREGAR CONTEXTO DO DIÁRIO (Cabeçalho + Lista de Alunos)
app.get("/escola_tecnica/diario/:id", (req, res) => {
    const alocacaoId = req.params.id;

    const sqlDados = `
        SELECT 
            d.nome as disciplina, 
            t.codigo as turma, 
            t.id as turma_id,
            c.nome as curso,
            td.id as turma_disciplina_id,
            ap.professor_id
        FROM alocacao_professores ap
        INNER JOIN turma_disciplinas td ON ap.turma_disciplina_id = td.id
        INNER JOIN disciplinas d ON td.disciplina_id = d.id
        INNER JOIN turmas t ON td.turma_id = t.id
        INNER JOIN cursos c ON t.curso_id = c.id
        WHERE ap.id = ?
    `;

    db_esc_tec.query(sqlDados, [alocacaoId], (err, resultDados) => {
        if (err) {
            console.error("❌ Erro ao buscar dados do diário:", err);
            return res.status(500).json({ error: "Erro interno ao buscar diário." });
        }

        if (resultDados.length === 0) {
            return res.status(404).json({ error: "Diário não encontrado." });
        }

        const dadosTurma = resultDados[0];

        const sqlAlunos = `
            SELECT 
                m.id as matricula_id, 
                p.nome_completo, 
                a.matricula 
            FROM matriculas m
            INNER JOIN alunos a ON m.aluno_id = a.id
            INNER JOIN pessoas p ON a.pessoa_id = p.id
            -- AQUI ESTAVA O ERRO: Trocamos 'm.ativo = 1' por 'm.status'
            WHERE m.turma_id = ? AND m.status = 'Ativo' 
            ORDER BY p.nome_completo ASC
        `;
        
        db_esc_tec.query(sqlAlunos, [dadosTurma.turma_id], (errAlunos, resultAlunos) => {
            if (errAlunos) {
                console.error("❌ Erro ao buscar alunos da turma:", errAlunos);
                return res.status(500).json({ error: "Erro ao buscar alunos." });
            }

            res.json({
                disciplina: dadosTurma.disciplina,
                turma: dadosTurma.turma,
                curso: dadosTurma.curso,
                turma_disciplina_id: dadosTurma.turma_disciplina_id,
                professor_id: dadosTurma.professor_id,
                alunos: resultAlunos
            });
        });
    });
});


// 3. LISTAR AULAS JÁ DADAS (HISTÓRICO)
app.get("/escola_tecnica/diario/:alocacaoId/historico", (req, res) => {
    const idAlocacao = req.params.alocacaoId;

    const sql = `
        SELECT 
            a.id, a.data_aula, a.conteudo,
            (SELECT COUNT(*) FROM frequencias f WHERE f.aula_id = a.id AND f.status = 'Presente') as presentes,
            (SELECT COUNT(*) FROM frequencias f WHERE f.aula_id = a.id AND f.status != 'Presente') as ausentes
        FROM aulas a
        INNER JOIN turma_disciplinas td ON a.turma_disciplina_id = td.id
        INNER JOIN alocacao_professores ap ON ap.turma_disciplina_id = td.id
        WHERE ap.id = ? 
        AND a.professor_id = ap.professor_id -- Garante que só mostra as aulas DELE
        ORDER BY a.data_aula DESC
    `;

    db_esc_tec.query(sql, [idAlocacao], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar histórico." });
        res.json(results);
    });
});

// 4. EXCLUIR UMA AULA LANÇADA
// 12. EXCLUIR AULA (DELETE)
app.delete("/escola_tecnica/aulas/:id", (req, res) => {
    const aulaId = req.params.id;

    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro de conexão." });

        conn.beginTransaction(async (err) => {
            if (err) { conn.release(); return res.status(500).json({ error: "Erro transação." }); }

            try {
                // 1. Apaga as frequências vinculadas
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM frequencias WHERE aula_id = ?", [aulaId], (e, r) => e ? reject(e) : resolve(r));
                });

                // 2. Apaga a aula
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM aulas WHERE id = ?", [aulaId], (e, r) => e ? reject(e) : resolve(r));
                });

                conn.commit(() => {
                    conn.release();
                    res.json({ message: "Aula excluída com sucesso!" });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    res.status(500).json({ error: "Erro ao excluir aula." });
                });
            }
        });
    });
});


// 5. BUSCAR DETALHES DE UMA AULA (PARA EDIÇÃO)
app.get("/escola_tecnica/aulas/:id", (req, res) => {
    const aulaId = req.params.id;

    const sqlAula = "SELECT * FROM aulas WHERE id = ?";
    const sqlFreq = "SELECT matricula_id, status, observacao FROM frequencias WHERE aula_id = ?";

    db_esc_tec.query(sqlAula, [aulaId], (err, resultAula) => {
        if (err || resultAula.length === 0) return res.status(404).json({ error: "Aula não encontrada." });

        db_esc_tec.query(sqlFreq, [aulaId], (err, resultFreq) => {
            if (err) return res.status(500).json({ error: "Erro ao buscar frequências." });
            
            res.json({
                dados: resultAula[0],
                frequencias: resultFreq
            });
        });
    });
});

// 6. ATUALIZAR AULA (PUT)
app.put("/escola_tecnica/aulas/:id", (req, res) => {
    const aulaId = req.params.id;
    const { data_aula, conteudo, frequencias } = req.body;

    db_esc_tec.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Erro conexão." });

        conn.beginTransaction(async (err) => {
            if (err) { conn.release(); return res.status(500).json({ error: "Erro transação." }); }

            try {
                // 1. Atualiza dados básicos da aula
                await new Promise((resolve, reject) => {
                    conn.query(
                        "UPDATE aulas SET data_aula = ?, conteudo = ? WHERE id = ?",
                        [data_aula, conteudo, aulaId],
                        (e, r) => e ? reject(e) : resolve(r)
                    );
                });

                // 2. Atualiza frequências (Estratégia: Limpar e Inserir de novo)
                // Isso é mais seguro e simples do que tentar comparar linha a linha
                if (frequencias && frequencias.length > 0) {
                    // Remove as antigas
                    await new Promise((resolve, reject) => {
                        conn.query("DELETE FROM frequencias WHERE aula_id = ?", [aulaId], (e, r) => e ? reject(e) : resolve(r));
                    });

                    // Insere as novas (atualizadas)
                    const values = frequencias.map(f => [aulaId, f.matricula_id, f.status, f.observacao || null]);
                    const sqlInsert = "INSERT INTO frequencias (aula_id, matricula_id, status, observacao) VALUES ?";
                    
                    await new Promise((resolve, reject) => {
                        conn.query(sqlInsert, [values], (e, r) => e ? reject(e) : resolve(r));
                    });
                }

                conn.commit(() => {
                    conn.release();
                    res.json({ message: "Aula atualizada com sucesso!" });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    res.status(500).json({ error: "Erro ao atualizar." });
                });
            }
        });
    });
});

// 9. ESTATÍSTICAS DA TURMA (Para Gráficos)
// 9. ESTATÍSTICAS DA TURMA (Corrigido com ID)
app.get("/escola_tecnica/alocacoes/:id/estatisticas", (req, res) => {
    const alocacaoId = req.params.id;

    const sqlAlocacao = "SELECT turma_disciplina_id FROM alocacao_professores WHERE id = ?";

    db_esc_tec.query(sqlAlocacao, [alocacaoId], (err, resultAloc) => {
        if (err || resultAloc.length === 0) return res.status(404).json({ error: "Alocação não encontrada." });

        const turmaDiscId = resultAloc[0].turma_disciplina_id;

        const sqlStats = `
            SELECT 
                p.nome_completo, 
                f.matricula_id, 
                f.status 
            FROM frequencias f
            INNER JOIN aulas a ON f.aula_id = a.id
            INNER JOIN matriculas m ON f.matricula_id = m.id
            INNER JOIN alunos al ON m.aluno_id = al.id
            INNER JOIN pessoas p ON al.pessoa_id = p.id
            WHERE a.turma_disciplina_id = ?
        `;

        db_esc_tec.query(sqlStats, [turmaDiscId], (errStats, results) => {
            if (errStats) return res.status(500).json({ error: "Erro ao calcular estatísticas." });
            
            const mapaAlunos = {};
            let totalPresencasGeral = 0;
            let totalFaltasGeral = 0;
            let totalJustificativasGeral = 0;

            results.forEach(reg => {
                if (!mapaAlunos[reg.matricula_id]) {
                    mapaAlunos[reg.matricula_id] = {
                        matricula_id: reg.matricula_id, // AGORA O ID VAI JUNTO! ✅
                        nome: reg.nome_completo,
                        presencas: 0,
                        faltas: 0,
                        justificados: 0,
                        total_aulas: 0
                    };
                }

                const aluno = mapaAlunos[reg.matricula_id];
                aluno.total_aulas++;

                if (reg.status === 'Presente') {
                    aluno.presencas++;
                    totalPresencasGeral++;
                } else if (reg.status === 'Ausente') {
                    aluno.faltas++;
                    totalFaltasGeral++;
                } else if (reg.status === 'Justificado') {
                    aluno.justificados++;
                    totalJustificativasGeral++;
                }
            });

            const listaAlunos = Object.values(mapaAlunos).map(a => {
                const percentual = a.total_aulas > 0 ? ((a.presencas + a.justificados) / a.total_aulas) * 100 : 100;
                return {
                    ...a,
                    percentual: percentual.toFixed(1)
                };
            }).sort((a, b) => a.percentual - b.percentual);

            const graficoGeral = [
                { name: 'Presenças', value: totalPresencasGeral, fill: '#22c55e' },
                { name: 'Faltas', value: totalFaltasGeral, fill: '#ef4444' },
                { name: 'Justificativas', value: totalJustificativasGeral, fill: '#f97316' }
            ];

            res.json({
                resumo: graficoGeral,
                alunos: listaAlunos
            });
        });
    });
});

app.get("/escola_tecnica/diario/:id/aulas", (req, res) => {
    const alocacaoId = req.params.id;

    // 1. Primeiro precisamos saber qual é a turma_disciplina dessa alocação
    const sqlAloc = "SELECT turma_disciplina_id, professor_id FROM alocacao_professores WHERE id = ?";

    db_esc_tec.query(sqlAloc, [alocacaoId], (err, resultAloc) => {
        if (err || resultAloc.length === 0) return res.status(404).json({ error: "Alocação não encontrada." });

        const { turma_disciplina_id, professor_id } = resultAloc[0];

        // 2. Agora buscamos as aulas dessa disciplina dadas por esse professor
        const sqlAulas = `
            SELECT id, data_aula, conteudo 
            FROM aulas 
            WHERE turma_disciplina_id = ? 
            -- Se quiser ver as aulas de OUTROS professores dessa matéria, remova a linha abaixo:
            AND professor_id = ? 
            ORDER BY data_aula DESC
        `;

        db_esc_tec.query(sqlAulas, [turma_disciplina_id, professor_id], (errAulas, resultAulas) => {
            if (errAulas) return res.status(500).json({ error: "Erro ao buscar histórico de aulas." });
            
            res.json(resultAulas);
        });
    });
});

// =================================================================
// ÁREA DE RELATÓRIOS (COORDENAÇÃO)
// =================================================================

// 13. LISTAR TURMAS ATIVAS (Para o Filtro)
app.get("/escola_tecnica/relatorios/turmas-ativas", (req, res) => {
    const sql = `
        SELECT t.id, t.codigo, c.nome as nome_curso 
        FROM turmas t
        INNER JOIN cursos c ON t.curso_id = c.id
        WHERE t.ativa = 1
        ORDER BY t.codigo ASC
    `;
    db_esc_tec.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar turmas." });
        res.json(results);
    });
});

// 14. LISTAR DISCIPLINAS DE UMA TURMA (Que tenham professor alocado)
app.get("/escola_tecnica/relatorios/turmas/:id/disciplinas", (req, res) => {
    const turmaId = req.params.id;

    // Buscamos apenas disciplinas que têm uma alocação ativa (tem professor)
    // Retornamos o 'alocacao_id' porque é ele que gera os gráficos!
    const sql = `
        SELECT 
            d.nome as disciplina,
            p.nome_completo as professor,
            ap.id as alocacao_id
        FROM alocacao_professores ap
        INNER JOIN turma_disciplinas td ON ap.turma_disciplina_id = td.id
        INNER JOIN disciplinas d ON td.disciplina_id = d.id
        INNER JOIN professores prof ON ap.professor_id = prof.id
        INNER JOIN pessoas p ON prof.pessoa_id = p.id
        WHERE td.turma_id = ? AND ap.ativo = 1
    `;

    db_esc_tec.query(sql, [turmaId], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar disciplinas." });
        res.json(results);
    });
});

// 15. HISTÓRICO INDIVIDUAL DO ALUNO (Para o Modal do Coordenador)
app.get("/escola_tecnica/relatorios/aluno/:matriculaId/alocacao/:alocacaoId", (req, res) => {
    const { matriculaId, alocacaoId } = req.params;

    // 1. Descobre a disciplina
    const sqlTurma = "SELECT turma_disciplina_id FROM alocacao_professores WHERE id = ?";
    
    db_esc_tec.query(sqlTurma, [alocacaoId], (err, resTurma) => {
        if (err || resTurma.length === 0) return res.status(404).json({ error: "Alocação não encontrada" });
        
        const tdId = resTurma[0].turma_disciplina_id;

        // 2. Busca todas as aulas e o status desse aluno específico
        const sqlHist = `
            SELECT 
                a.data_aula, 
                a.conteudo,
                f.status,
                f.observacao
            FROM frequencias f
            INNER JOIN aulas a ON f.aula_id = a.id
            WHERE f.matricula_id = ? AND a.turma_disciplina_id = ?
            ORDER BY a.data_aula DESC
        `;

        db_esc_tec.query(sqlHist, [matriculaId, tdId], (errHist, resultHist) => {
            if (errHist) return res.status(500).json({ error: "Erro ao buscar histórico" });
            res.json(resultHist);
        });
    });
});





// Inicia
app.listen(PORT, () => {
    console.log(`🔥 Servidor API rodando na porta ${PORT}`);
});