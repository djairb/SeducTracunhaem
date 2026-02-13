export const MOCK_DATA = {
    escolas: [
        { id: 1, nome: "Escola Municipal Joaquim Canuto de Araújo", inep: "12345678", endereco: "Bairro Novo", ativo: true, nivel: "Infantil" },
        { id: 2, nome: "Escola Municipal Tancredo Neves", inep: "87654321", endereco: "Bairro Novo", ativo: true, nivel: "Iniciais" },
        { id: 3, nome: "Escola Municipal Profa. Maria Clemilda Coelho da Silva", inep: "13579246", endereco: "Baixa Verde", ativo: true, nivel: "Finais" }
    ],
    turmas: [
        // Escola 1: Joaquim Canuto (Infantil)
        { id: 101, escola_id: 1, nome: "Berçário I - A", codigo: "BER-01A", nome_curso: "Educação Infantil", ano_letivo: 2024, periodo: "2024.1", nivel_ensino: "Infantil", turno: "Manhã", ativa: true, total_alunos: 15 },
        { id: 102, escola_id: 1, nome: "Maternal II - C", codigo: "MAT-02C", nome_curso: "Educação Infantil", ano_letivo: 2024, periodo: "2024.1", nivel_ensino: "Infantil", turno: "Tarde", ativa: true, total_alunos: 12 },

        // Escola 2: Tancredo Neves (Iniciais)
        { id: 201, escola_id: 2, nome: "1º Ano A", codigo: "1ZA-01", nome_curso: "Ensino Fundamental - Anos Iniciais", ano_letivo: 2024, periodo: "2024.1", nivel_ensino: "Iniciais", turno: "Manhã", ativa: true, total_alunos: 25 },
        { id: 202, escola_id: 2, nome: "3º Ano B", codigo: "3ZB-02", nome_curso: "Ensino Fundamental - Anos Iniciais", ano_letivo: 2024, periodo: "2024.1", nivel_ensino: "Iniciais", turno: "Tarde", ativa: true, total_alunos: 22 },

        // Escola 3: Maria Clemilda (Finais)
        { id: 301, escola_id: 3, nome: "6º Ano A", codigo: "6ZA-01", nome_curso: "Ensino Fundamental - Anos Finais", ano_letivo: 2024, periodo: "2024.1", nivel_ensino: "Finais", turno: "Manhã", ativa: true, total_alunos: 30 },
        { id: 302, escola_id: 3, nome: "9º Ano B", codigo: "9ZB-02", nome_curso: "Ensino Fundamental - Anos Finais", ano_letivo: 2024, periodo: "2024.1", nivel_ensino: "Finais", turno: "Tarde", ativa: true, total_alunos: 28 }
    ],
    disciplinasPadrao: [
        // Infantil
        { id: 1, nome: 'Polivalente', nivel: 'Infantil' },
        { id: 2, nome: 'O Eu, O Outro e Nós', nivel: 'Infantil' },
        { id: 3, nome: 'Escuta, Fala, Pensamento e Imaginação', nivel: 'Infantil' },
        { id: 4, nome: 'Traços, Sons, Cores e Formas', nivel: 'Infantil' },
        { id: 5, nome: 'Espacos, Tempos, Quantidades, Relações e Transformações', nivel: 'Infantil' },

        // Anos Iniciais
        { id: 6, nome: 'Língua Portuguesa', nivel: 'Iniciais' },
        { id: 7, nome: 'Matemática', nivel: 'Iniciais' },
        { id: 8, nome: 'Ciências', nivel: 'Iniciais' },
        { id: 9, nome: 'História', nivel: 'Iniciais' },
        { id: 10, nome: 'Geografia', nivel: 'Iniciais' },
        { id: 11, nome: 'Educação Física', nivel: 'Iniciais' },
        { id: 12, nome: 'Arte', nivel: 'Iniciais' },
        { id: 13, nome: 'Ensino Religioso', nivel: 'Iniciais' },
        { id: 14, nome: 'Polivalente', nivel: 'Iniciais' },

        // Anos Finais
        { id: 15, nome: 'Língua Portuguesa', nivel: 'Finais' },
        { id: 16, nome: 'Matemática', nivel: 'Finais' },
        { id: 17, nome: 'Ciências', nivel: 'Finais' },
        { id: 18, nome: 'História', nivel: 'Finais' },
        { id: 19, nome: 'Geografia', nivel: 'Finais' },
        { id: 20, nome: 'Educação Física', nivel: 'Finais' },
        { id: 21, nome: 'Arte', nivel: 'Finais' },
        { id: 22, nome: 'Ensino Religioso', nivel: 'Finais' },
        { id: 23, nome: 'Língua Inglesa', nivel: 'Finais' }
    ],
    alunos: [
        // Turma 101 (Infantil - Manhã) - Escola 1
        { id: 1, nome: "Enzo Gabriel Rocha", turma_id: 101, status: "Ativo" },
        { id: 2, nome: "Valentina Silva Souza", turma_id: 101, status: "Ativo" },
        { id: 3, nome: "Heitor Costa Alves", turma_id: 101, status: "Ativo" },
        { id: 4, nome: "Alice Ferreira Lima", turma_id: 101, status: "Ativo" },
        { id: 5, nome: "Theo Santos Oliveira", turma_id: 101, status: "Ativo" },
        { id: 6, nome: "Sophia Rodrigues Dias", turma_id: 101, status: "Ativo" },
        { id: 7, nome: "Bernardo Pereira Gomes", turma_id: 101, status: "Ativo" },
        { id: 8, nome: "Helena Martins Ribeiro", turma_id: 101, status: "Ativo" },
        { id: 9, nome: "Gael Almeida Carvalho", turma_id: 101, status: "Ativo" },
        { id: 10, nome: "Manuela Barbosa Pinto", turma_id: 101, status: "Ativo" },

        // Turma 102 (Infantil - Tarde) - Escola 1
        { id: 11, nome: "Davi Lucca Moraes", turma_id: 102, status: "Ativo" },
        { id: 12, nome: "Laura Cardoso Castro", turma_id: 102, status: "Ativo" },
        { id: 13, nome: "Gabriel Moura Teixeira", turma_id: 102, status: "Ativo" },
        { id: 14, nome: "Maria Eduarda Nogueira", turma_id: 102, status: "Ativo" },
        { id: 15, nome: "Pedro Henrique Farias", turma_id: 102, status: "Ativo" },
        { id: 16, nome: "Lívia Campos Araújo", turma_id: 102, status: "Ativo" },
        { id: 17, nome: "Samuel Mendes Reis", turma_id: 102, status: "Ativo" },
        { id: 18, nome: "Cecília Vieira Ramos", turma_id: 102, status: "Ativo" },
        { id: 19, nome: "Lorenzo Batista Duarte", turma_id: 102, status: "Ativo" },
        { id: 20, nome: "Isabella Freitas Nunes", turma_id: 102, status: "Ativo" },

        // Turma 201 (Iniciais - Manhã) - Escola 2
        { id: 21, nome: "Lucas Souza Melo", turma_id: 201, status: "Ativo" },
        { id: 22, nome: "Beatriz Oliveira Santos", turma_id: 201, status: "Ativo" },
        { id: 23, nome: "Gustavo Lima Cunha", turma_id: 201, status: "Ativo" },
        { id: 24, nome: "Mariana Azevedo Barros", turma_id: 201, status: "Ativo" },
        { id: 25, nome: "Felipe Correia Lopes", turma_id: 201, status: "Ativo" },
        { id: 26, nome: "Clara Nascimento Brito", turma_id: 201, status: "Ativo" },
        { id: 27, nome: "João Pedro Fernandes", turma_id: 201, status: "Ativo" },
        { id: 28, nome: "Júlia Magalhães Pires", turma_id: 201, status: "Ativo" },
        { id: 29, nome: "Rafael Leite Monteiro", turma_id: 201, status: "Ativo" },
        { id: 30, nome: "Ana Clara Torres Braga", turma_id: 201, status: "Ativo" },

        // Turma 202 (Iniciais - Tarde) - Escola 2
        { id: 31, nome: "Daniel Moreira Dias", turma_id: 202, status: "Ativo" },
        { id: 32, nome: "Lara Dantas Cruz", turma_id: 202, status: "Ativo" },
        { id: 33, nome: "Matheus Siqueira Campos", turma_id: 202, status: "Ativo" },
        { id: 34, nome: "Yasmin Andrade Rocha", turma_id: 202, status: "Ativo" },
        { id: 35, nome: "Henrique Figueiredo Paz", turma_id: 202, status: "Ativo" },
        { id: 36, nome: "Letícia Fonseca Paiva", turma_id: 202, status: "Ativo" },
        { id: 37, nome: "Murilo Borges Lemos", turma_id: 202, status: "Ativo" },
        { id: 38, nome: "Camila Rezende Frota", turma_id: 202, status: "Ativo" },
        { id: 39, nome: "Nicolas Veloso Guerra", turma_id: 202, status: "Ativo" },
        { id: 40, nome: "Vitória Aguiar Uchoa", turma_id: 202, status: "Ativo" },

        // Turma 301 (Finais - Manhã) - Escola 3
        { id: 41, nome: "Pietro Machado Viana", turma_id: 301, status: "Ativo" },
        { id: 42, nome: "Melissa Guimarães Rios", turma_id: 301, status: "Ativo" },
        { id: 43, nome: "Isaac Tavares Mota", turma_id: 301, status: "Ativo" },
        { id: 44, nome: "Rebeca Pacheco Franco", turma_id: 301, status: "Ativo" },
        { id: 45, nome: "Benjamin Peixoto Sales", turma_id: 301, status: "Ativo" },
        { id: 46, nome: "Sarah Xavier Neves", turma_id: 301, status: "Ativo" },
        { id: 47, nome: "Lucca Medeiros Varela", turma_id: 301, status: "Ativo" },
        { id: 48, nome: "Elisa Fontes Brandão", turma_id: 301, status: "Ativo" },
        { id: 49, nome: "Tomás Bittencourt Maia", turma_id: 301, status: "Ativo" },
        { id: 50, nome: "Bianca Antunes Vargas", turma_id: 301, status: "Ativo" },

        // Turma 302 (Finais - Tarde) - Escola 3
        { id: 51, nome: "Bryan Cavalcanti Lins", turma_id: 302, status: "Ativo" },
        { id: 52, nome: "Nicole Furtado Ramos", turma_id: 302, status: "Ativo" },
        { id: 53, nome: "Caleb Vasconcelos Brito", turma_id: 302, status: "Ativo" },
        { id: 54, nome: "Emanuelly Gadelha Pontes", turma_id: 302, status: "Ativo" },
        { id: 55, nome: "Antônio Holanda Saraiva", turma_id: 302, status: "Ativo" },
        { id: 56, nome: "Lorena Coutinho Bezerra", turma_id: 302, status: "Ativo" },
        { id: 57, nome: "Joaquim Almeida Muniz", turma_id: 302, status: "Ativo" },
        { id: 58, nome: "Maitê Pinheiro Galvão", turma_id: 302, status: "Ativo" },
        { id: 59, nome: "Francisco Barros Aragão", turma_id: 302, status: "Ativo" },
        { id: 60, nome: "Olívia Sampaio Abreu", turma_id: 302, status: "Ativo" }
    ]
};
