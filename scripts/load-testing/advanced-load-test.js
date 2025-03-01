import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Métricas personalizadas
const failedRequests = new Counter('failed_requests');
const searchTime = new Trend('search_time');
const articleLoadTime = new Trend('article_load_time');

// Configuração do teste
export const options = {
  // Estágios do teste de carga
  scenarios: {
    // Cenário de navegação básica (usuários não autenticados)
    casual_visitors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 }, // Rampa de subida para 100 usuários em 1 minuto
        { duration: '5m', target: 100 }, // Manter 100 usuários por 5 minutos
        { duration: '1m', target: 0 }, // Rampa de descida para 0 usuários em 1 minuto
      ],
      gracefulRampDown: '30s',
    },
    // Cenário de usuários autenticados
    authenticated_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 }, // Rampa de subida para 50 usuários em 1 minuto
        { duration: '5m', target: 50 }, // Manter 50 usuários por 5 minutos
        { duration: '1m', target: 0 }, // Rampa de descida para 0 usuários em 1 minuto
      ],
      gracefulRampDown: '30s',
    },
    // Cenário de pico de tráfego (simulando um evento de notícia viral)
    traffic_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 500,
      stages: [
        { duration: '30s', target: 10 }, // Aumentar para 10 requisições por segundo em 30 segundos
        { duration: '1m', target: 50 }, // Aumentar para 50 requisições por segundo em 1 minuto
        { duration: '2m', target: 50 }, // Manter 50 requisições por segundo por 2 minutos
        { duration: '30s', target: 0 }, // Diminuir para 0 requisições por segundo em 30 segundos
      ],
    },
  },
  // Limites de aceitação
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser concluídas em menos de 500ms
    http_req_failed: ['rate<0.01'], // Menos de 1% das requisições podem falhar
    failed_requests: ['count<50'], // Menos de 50 requisições podem falhar no total
    search_time: ['p(95)<800'], // 95% das buscas devem ser concluídas em menos de 800ms
    article_load_time: ['p(95)<600'], // 95% dos carregamentos de artigos devem ser concluídos em menos de 600ms
  },
};

// URL base do site (deve ser alterada para o ambiente de teste)
const BASE_URL = 'http://localhost:3000';

// Lista de usuários de teste (simulados)
const TEST_USERS = [
  { email: 'teste1@example.com', password: 'senha123' },
  { email: 'teste2@example.com', password: 'senha123' },
  { email: 'teste3@example.com', password: 'senha123' },
  { email: 'teste4@example.com', password: 'senha123' },
  { email: 'teste5@example.com', password: 'senha123' },
];

// Lista de termos de pesquisa
const SEARCH_TERMS = [
  'política',
  'economia',
  'esportes',
  'tecnologia',
  'saúde',
  'educação',
  'rio',
  'brasil',
  'covid',
];

// Função para simular usuários não autenticados
export function casualVisitor() {
  group('Navegação Básica', function () {
    // Acesso à página inicial
    let homeResponse = http.get(`${BASE_URL}/`);
    check(homeResponse, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage has correct title': (r) => r.body.includes('Rio de Fato'),
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 3));

    // Acesso à página de notícias
    let newsResponse = http.get(`${BASE_URL}/noticias`);
    check(newsResponse, {
      'news page status is 200': (r) => r.status === 200,
      'news page has content': (r) => r.body.includes('notícias'),
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 3));

    // Acesso a uma categoria aleatória
    const categories = [
      'tecnologia',
      'esportes',
      'politica',
      'economia',
      'entretenimento',
      'saude',
      'educacao',
      'ciencia',
    ];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    let categoryResponse = http.get(
      `${BASE_URL}/noticias/categoria/${randomCategory}`
    );
    check(categoryResponse, {
      'category page status is 200': (r) => r.status === 200,
    }) || failedRequests.add(1);

    sleep(randomIntBetween(2, 5));

    // Pesquisa de notícias
    const searchTerm =
      SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const searchStartTime = new Date();
    let searchResponse = http.get(`${BASE_URL}/noticias/busca?q=${searchTerm}`);
    searchTime.add(new Date() - searchStartTime);

    check(searchResponse, {
      'search page status is 200': (r) => r.status === 200,
      'search page has results': (r) => r.body.includes('resultados'),
    }) || failedRequests.add(1);

    sleep(randomIntBetween(2, 4));
  });
}

// Função para simular usuários autenticados
export function authenticatedUser() {
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  let authToken = null;

  group('Autenticação e Navegação', function () {
    // Login (simulado - na prática, você precisaria implementar a lógica real de autenticação)
    let loginResponse = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Simulando obtenção de token (em um cenário real, você extrairia o token da resposta)
    authToken = 'simulated-auth-token';

    check(loginResponse, {
      'login successful': (r) => r.status === 200 || r.status === 302,
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 3));

    // Acesso ao perfil do usuário
    let profileResponse = http.get(`${BASE_URL}/perfil`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    check(profileResponse, {
      'profile page status is 200': (r) => r.status === 200,
      'profile page has user info': (r) => r.body.includes('perfil'),
    }) || failedRequests.add(1);

    sleep(randomIntBetween(2, 4));

    // Leitura de um artigo
    const articleStartTime = new Date();
    let articleResponse = http.get(`${BASE_URL}/noticias/1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    articleLoadTime.add(new Date() - articleStartTime);

    check(articleResponse, {
      'article page status is 200': (r) => r.status === 200,
    }) || failedRequests.add(1);

    sleep(randomIntBetween(5, 10));

    // Comentário em um artigo (simulado)
    let commentResponse = http.post(
      `${BASE_URL}/api/noticias/1/comentarios`,
      JSON.stringify({
        content: 'Este é um comentário de teste para o teste de carga.',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    check(commentResponse, {
      'comment submission successful': (r) =>
        r.status === 200 || r.status === 201,
    }) || failedRequests.add(1);

    sleep(randomIntBetween(2, 5));
  });
}

// Função principal que decide qual cenário executar
export default function () {
  // Determinar qual cenário está sendo executado com base no executor
  if (__ITER % 3 === 0) {
    authenticatedUser();
  } else {
    casualVisitor();
  }
}

// Função executada uma vez no início do teste
export function setup() {
  console.log('Iniciando teste de carga avançado para o portal Rio de Fato');

  // Verificar se o site está acessível antes de iniciar o teste
  let checkResponse = http.get(`${BASE_URL}/`);
  if (checkResponse.status !== 200) {
    console.error(`Site não está acessível! Status: ${checkResponse.status}`);
  }

  return {};
}

// Função executada uma vez no final do teste
export function teardown(data) {
  console.log('Teste de carga avançado concluído');
}
