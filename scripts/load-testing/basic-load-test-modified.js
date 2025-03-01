import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// Métricas personalizadas
const failedRequests = new Counter('failed_requests');

// Configuração do teste
export const options = {
  // Estágios do teste de carga
  stages: [
    { duration: '30s', target: 20 }, // Rampa de subida para 20 usuários em 30 segundos
    { duration: '1m', target: 20 }, // Manter 20 usuários por 1 minuto
    { duration: '30s', target: 50 }, // Aumentar para 50 usuários em 30 segundos
    { duration: '1m', target: 50 }, // Manter 50 usuários por 1 minuto
    { duration: '30s', target: 0 }, // Rampa de descida para 0 usuários em 30 segundos
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

  // Teste da página de mais lidas
  let maisLidasResponse = http.get(`${BASE_URL}/mais-lidas`);
  check(maisLidasResponse, {
    'mais-lidas page status is 200': (r) => r.status === 200,
    'mais-lidas page has content': (r) => r.body.includes('Mais Lidas'),
  }) || failedRequests.add(1);

  sleep(1);

  // Teste da página de categorias
  let categoriesResponse = http.get(`${BASE_URL}/categorias`);
  check(categoriesResponse, {
    'categories page status is 200': (r) => r.status === 200,
    'categories page has content': (r) => r.body.includes('categorias'),
  }) || failedRequests.add(1);

  sleep(1);

  // Teste da página de categoria específica (esportes)
  let sportsResponse = http.get(`${BASE_URL}/categorias/esportes`);
  check(sportsResponse, {
    'sports category page status is 200': (r) => r.status === 200,
    'sports category page has content': (r) => r.body.includes('Esportes'),
  }) || failedRequests.add(1);

  sleep(1);

  // Teste de APIs (se disponíveis)
  let weatherResponse = http.get(`${BASE_URL}/api/weather`);
  check(weatherResponse, {
    'weather API status is 200': (r) => r.status === 200,
  }) || failedRequests.add(1);

  sleep(1);

  let marketResponse = http.get(`${BASE_URL}/api/market`);
  check(marketResponse, {
    'market API status is 200': (r) => r.status === 200,
  }) || failedRequests.add(1);

  sleep(2);
}

// Função executada uma vez no início do teste
export function setup() {
  console.log('Iniciando teste de carga modificado para o portal Rio de Fato');
  console.log(
    'Testando rotas existentes: homepage, mais-lidas, categorias, e APIs'
  );
  return {};
}

// Função executada uma vez no final do teste
export function teardown(data) {
  console.log('Teste de carga modificado concluído');
}
