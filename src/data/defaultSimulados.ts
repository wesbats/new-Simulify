import { Simulado } from '../types';

export const DEFAULT_SIMULADOS: Simulado[] = [
  {
    id: 'demo-historia-brasil',
    title: 'História do Brasil',
    description: 'Questões essenciais sobre o período republicano, presidentes e marcos da independência nacional.',
    isPreset: true,
    createdAt: '2026-10-08T00:00:00.000Z',
    tags: ['História', 'ENEM', 'Básico'],
    timeLimitMinutes: 15,
    questions: [
      {
        question: 'Em que ano foi proclamada a República do Brasil?',
        options: [
          '1822',
          '1889',
          '1891',
          '1500'
        ],
        correct: 1,
        explanation: 'A República foi proclamada em 15 de novembro de 1889 pelo Marechal Deodoro da Fonseca.',
        subject: 'História do Brasil',
        difficulty: 1
      },
      {
        question: 'Quem foi o primeiro presidente do Brasil?',
        options: [
          'Dom Pedro II',
          'Getúlio Vargas',
          'Deodoro da Fonseca',
          'Prudente de Morais'
        ],
        correct: 2,
        explanation: 'O Marechal Deodoro da Fonseca foi o primeiro presidente, governando de 1889 a 1891.',
        subject: 'História do Brasil',
        difficulty: 1
      },
      {
        question: 'Qual foi a primeira capital do Brasil?',
        options: [
          'Rio de Janeiro',
          'São Paulo',
          'Salvador',
          'Brasília'
        ],
        correct: 2,
        explanation: 'Salvador foi a primeira capital, de 1549 até 1763, quando a capital foi transferida para o Rio de Janeiro.',
        subject: 'História do Brasil',
        difficulty: 1
      },
      {
        question: 'Em que ano o Brasil se tornou independente de Portugal?',
        options: [
          '1808',
          '1822',
          '1889',
          '1500'
        ],
        correct: 1,
        explanation: 'A independência foi proclamada por Dom Pedro I em 7 de setembro de 1822.',
        subject: 'História do Brasil',
        difficulty: 1
      }
    ]
  },
  {
    id: 'demo-portugues-concursos',
    title: 'Português para Concursos & ENEM',
    description: 'Simulado focado nas matérias que mais reprovam: Crase, Concordância Verbal e Regência.',
    isPreset: true,
    createdAt: '2026-10-08T00:00:00.000Z',
    tags: ['Português', 'Concursos', 'Intermediário'],
    timeLimitMinutes: 20,
    questions: [
      {
        question: 'Assinale a alternativa em que o uso do acento indicativo de crase está CORRETO conforme a norma-padrão:',
        options: [
          'O candidato começou à responder as questões com calma.',
          'Entregamos o documento à Sua Excelência ontem pela manhã.',
          'O diretor referiu-se às normas estabelecidas no edital.',
          'Eles compraram os ingressos à prazo.'
        ],
        correct: 2,
        explanation: 'Em "referiu-se às normas", ocorre a fusão da preposição "a" (exigida pela regência de "referir-se") com o artigo feminino plural "as". Antes de verbo, pronomes de tratamento e palavras masculinas, a crase é proibida.',
        subject: 'Língua Portuguesa',
        difficulty: 2
      },
      {
        question: 'Quanto à concordância verbal, assinale a opção que atende à norma culta da língua portuguesa:',
        options: [
          'Fazem dez anos que estudo para concursos federais.',
          'Houveram muitos candidatos aprovados na primeira fase.',
          'Faz dez anos que estudo para concursos federais.',
          'Devem haver alternativas melhores para este problema.'
        ],
        correct: 2,
        explanation: 'O verbo "fazer" indicando tempo decorrido é impessoal, portanto fica no singular: "Faz dez anos". O mesmo vale para "haver" no sentido de existir ("Houve muitos... / Deve haver...").',
        subject: 'Língua Portuguesa',
        difficulty: 2
      },
      {
        question: 'Em "O advogado assistiu ______ cliente durante todo o interrogatório policial", a regência do verbo assistir no sentido de prestar assistência exige:',
        options: [
          'obrigatoriamente a preposição "a" (ao cliente).',
          'o complemento direto sem preposição (o cliente) ou preposicionado (ao cliente).',
          'apenas a preposição "de" (do cliente).',
          'a preposição "em" (no cliente).'
        ],
        correct: 1,
        explanation: 'No sentido de prestar socorro/ajudar/acompanhar, o verbo "assistir" aceita tanto regência direta (assistir o cliente) quanto transitiva indireta (assistir ao cliente).',
        subject: 'Língua Portuguesa',
        difficulty: 3
      },
      {
        question: 'Assinale a frase em que o pronome relativo foi empregado em desacordo com a regência do verbo:',
        options: [
          'Este é o cargo a que sempre aspirei.',
          'A matéria de que mais gosto é Direito Constitucional.',
          'O livro que li trazia ótimos simulados.',
          'Esta é a banca examinadora que discordo veementemente.'
        ],
        correct: 3,
        explanation: 'Quem discorda, discorda DE algo ou alguém. O correto seria: "Esta é a banca examinadora DE QUE (ou da qual) discordo".',
        subject: 'Língua Portuguesa',
        difficulty: 2
      },
      {
        question: 'Identifique a frase com pontuação estritamente correta:',
        options: [
          'Os alunos que estudaram com foco, foram aprovados com louvor.',
          'Brasília, a capital do país, foi fundada em 1960.',
          'Após o simulado os estudantes, comemoraram o bom resultado.',
          'Ontem à tarde o professor, explicou as regras do edital.'
        ],
        correct: 1,
        explanation: '"A capital do país" é um aposto explicativo e deve vir isolado por vírgulas. Não se separa sujeito de predicado por vírgula.',
        subject: 'Língua Portuguesa',
        difficulty: 1
      }
    ]
  }
];
