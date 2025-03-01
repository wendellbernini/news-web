import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// Métricas personalizadas
const failedRequests = new Counter('failed_requests');

// Configuração do teste
export const options = {
  // Estágios do teste de carga
  stages: [
    { duration: '1m', target: 50 }, // Rampa de subida para 50 usuários em 1 minuto
    { duration: '3m', target: 50 }, // Manter 50 usuários por 3 minutos
    { duration: '1m', target: 100 }, // Aumentar para 100 usuários em 1 minuto
    { duration: '5m', target: 100 }, // Manter 100 usuários por 5 minutos
    { duration: '1m', target: 0 }, // Rampa de descida para 0 usuários em 1 minuto
  ],
  // Limites de aceitação
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser concluídas em menos de 500ms
    http_req_failed: ['rate<0.01'], // Menos de 1% das requisições podem falhar
    failed_requests: ['count<10'], // Menos de 10 requisições podem falhar no total
  },
};

// URL base do site (deve ser alterada para o ambiente de teste)
const BASE_URL = 'http://localhost:3000';

// Função principal executada para cada usuário virtual
export default function () {
  // Teste da página inicial
  let homeResponse = http.get(`${BASE_URL}/`);
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has correct title': (r) => r.body.includes('Rio de Fato'),
  }) || failedRequests.add(1);

  sleep(1);

  // Teste da página de notícias
  let newsResponse = http.get(`${BASE_URL}/noticias`);
  check(newsResponse, {
    'news page status is 200': (r) => r.status === 200,
    'news page has content': (r) => r.body.includes('notícias'),
  }) || failedRequests.add(1);

  sleep(1);

  // Teste de uma categoria específica
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
    'category page has content': (r) => r.body.includes(randomCategory),
  }) || failedRequests.add(1);

  sleep(2);
}

// Função executada uma vez no início do teste
export function setup() {
  console.log('Iniciando teste de carga para o portal Rio de Fato');
  return {};
}

// Função executada uma vez no final do teste
export function teardown(data) {
  console.log('Teste de carga concluído');
}
