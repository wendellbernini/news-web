import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Métricas personalizadas
const failedRequests = new Counter('failed_requests');
const apiResponseTime = new Trend('api_response_time');

// Configuração do teste
export const options = {
  // Estágios do teste de carga
  stages: [
    { duration: '30s', target: 50 }, // Rampa de subida para 50 usuários em 30 segundos
    { duration: '1m', target: 50 }, // Manter 50 usuários por 1 minuto
    { duration: '30s', target: 100 }, // Aumentar para 100 usuários em 30 segundos
    { duration: '3m', target: 100 }, // Manter 100 usuários por 3 minutos
    { duration: '30s', target: 200 }, // Aumentar para 200 usuários em 30 segundos
    { duration: '1m', target: 200 }, // Manter 200 usuários por 1 minuto
    { duration: '30s', target: 0 }, // Rampa de descida para 0 usuários em 30 segundos
  ],
  // Limites de aceitação
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser concluídas em menos de 500ms
    http_req_failed: ['rate<0.01'], // Menos de 1% das requisições podem falhar
    failed_requests: ['count<50'], // Menos de 50 requisições podem falhar no total
    api_response_time: ['p(95)<300'], // 95% das respostas da API devem ser concluídas em menos de 300ms
  },
};

// URL base da API (deve ser alterada para o ambiente de teste)
const API_BASE_URL = 'http://localhost:3000/api';

// Lista de usuários de teste (simulados)
const TEST_USERS = [
  { email: 'teste1@example.com', password: 'senha123' },
  { email: 'teste2@example.com', password: 'senha123' },
  { email: 'teste3@example.com', password: 'senha123' },
  { email: 'teste4@example.com', password: 'senha123' },
  { email: 'teste5@example.com', password: 'senha123' },
];

// Função principal executada para cada usuário virtual
export default function () {
  // Selecionar um usuário aleatório para o teste
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  let authToken = null;

  group('API - Autenticação', function () {
    // Login
    const startTime = new Date();
    let loginResponse = http.post(
      `${API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    apiResponseTime.add(new Date() - startTime);

    check(loginResponse, {
      'login successful': (r) => r.status === 200 || r.status === 201,
      'response has token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.token !== undefined;
        } catch (e) {
          return false;
        }
      },
    }) || failedRequests.add(1);

    // Simulando obtenção de token (em um cenário real, você extrairia o token da resposta)
    authToken = 'simulated-auth-token';

    sleep(randomIntBetween(1, 2));
  });

  group('API - Listagem de Notícias', function () {
    // Obter lista de notícias
    const startTime = new Date();
    let newsResponse = http.get(`${API_BASE_URL}/noticias`);
    apiResponseTime.add(new Date() - startTime);

    check(newsResponse, {
      'news list status is 200': (r) => r.status === 200,
      'news list has items': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) && body.length > 0;
        } catch (e) {
          return false;
        }
      },
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 2));

    // Obter notícias por categoria
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

    const categoryStartTime = new Date();
    let categoryResponse = http.get(
      `${API_BASE_URL}/noticias/categoria/${randomCategory}`
    );
    apiResponseTime.add(new Date() - categoryStartTime);

    check(categoryResponse, {
      'category news status is 200': (r) => r.status === 200,
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 2));
  });

  group('API - Detalhes de Notícia', function () {
    // Obter detalhes de uma notícia específica (assumindo que existem pelo menos 10 notícias)
    const noticiaId = Math.floor(Math.random() * 10) + 1;

    const startTime = new Date();
    let noticiaResponse = http.get(`${API_BASE_URL}/noticias/${noticiaId}`);
    apiResponseTime.add(new Date() - startTime);

    check(noticiaResponse, {
      'noticia details status is 200': (r) => r.status === 200,
      'noticia has content': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined && body.titulo !== undefined;
        } catch (e) {
          return false;
        }
      },
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 3));
  });

  group('API - Busca', function () {
    // Realizar uma busca
    const searchTerms = [
      'política',
      'economia',
      'esportes',
      'tecnologia',
      'saúde',
      'educação',
      'rio',
      'brasil',
    ];
    const searchTerm =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const startTime = new Date();
    let searchResponse = http.get(
      `${API_BASE_URL}/noticias/busca?q=${searchTerm}`
    );
    apiResponseTime.add(new Date() - startTime);

    check(searchResponse, {
      'search status is 200': (r) => r.status === 200,
    }) || failedRequests.add(1);

    sleep(randomIntBetween(1, 2));
  });

  // Operações que requerem autenticação
  if (authToken) {
    group('API - Operações Autenticadas', function () {
      // Obter perfil do usuário
      const profileStartTime = new Date();
      let profileResponse = http.get(`${API_BASE_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      apiResponseTime.add(new Date() - profileStartTime);

      check(profileResponse, {
        'profile status is 200': (r) => r.status === 200,
      }) || failedRequests.add(1);

      sleep(randomIntBetween(1, 2));

      // Adicionar comentário em uma notícia
      const noticiaId = Math.floor(Math.random() * 10) + 1;
      const commentStartTime = new Date();
      let commentResponse = http.post(
        `${API_BASE_URL}/noticias/${noticiaId}/comentarios`,
        JSON.stringify({
          conteudo:
            'Este é um comentário de teste para o teste de carga da API.',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      apiResponseTime.add(new Date() - commentStartTime);

      check(commentResponse, {
        'comment submission successful': (r) =>
          r.status === 200 || r.status === 201,
      }) || failedRequests.add(1);

      sleep(randomIntBetween(1, 3));

      // Salvar notícia como favorita
      const favoriteStartTime = new Date();
      let favoriteResponse = http.post(
        `${API_BASE_URL}/usuarios/favoritos`,
        JSON.stringify({
          noticiaId: noticiaId,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      apiResponseTime.add(new Date() - favoriteStartTime);

      check(favoriteResponse, {
        'favorite submission successful': (r) =>
          r.status === 200 || r.status === 201,
      }) || failedRequests.add(1);

      sleep(randomIntBetween(1, 2));
    });
  }
}

// Função executada uma vez no início do teste
export function setup() {
  console.log('Iniciando teste de carga da API para o portal Rio de Fato');

  // Verificar se a API está acessível antes de iniciar o teste
  let checkResponse = http.get(`${API_BASE_URL}/status`);
  if (checkResponse.status !== 200) {
    console.error(`API não está acessível! Status: ${checkResponse.status}`);
  }

  return {};
}

// Função executada uma vez no final do teste
export function teardown(data) {
  console.log('Teste de carga da API concluído');
}
