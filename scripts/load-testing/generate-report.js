#!/usr/bin/env node

/**
 * Script para gerar um relatório visual em HTML dos resultados dos testes de carga
 *
 * Este script lê os arquivos JSON gerados pelos testes de carga
 * e gera um relatório HTML com gráficos e análises.
 *
 * Uso: node generate-report.js <diretório-de-resultados>
 */

const fs = require('fs');
const path = require('path');

// Obter o diretório de resultados da linha de comando
const resultsDir = process.argv[2];

if (!resultsDir) {
  console.error(`Erro: Diretório de resultados não especificado.`);
  console.log(`Uso: node generate-report.js <diretório-de-resultados>`);
  process.exit(1);
}

if (!fs.existsSync(resultsDir)) {
  console.error(`Erro: Diretório '${resultsDir}' não encontrado.`);
  process.exit(1);
}

console.log(`Gerando relatório visual para: ${resultsDir}`);

// Encontrar arquivos JSON de resultados
const resultFiles = fs
  .readdirSync(resultsDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(resultsDir, file));

if (resultFiles.length === 0) {
  console.error(
    `Erro: Nenhum arquivo de resultado (.json) encontrado em '${resultsDir}'.`
  );
  process.exit(1);
}

console.log(`Encontrados ${resultFiles.length} arquivos de resultados.`);

// Função para extrair métricas de um arquivo de resultados
function extractMetrics(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = JSON.parse(fileContent);
    const fileName = path.basename(filePath, '.json');

    // Extrair métricas relevantes
    const metrics = results.metrics || {};

    // Tempo de resposta
    const httpReqDuration = metrics.http_req_duration || {};
    const avgResponseTime =
      httpReqDuration.avg !== undefined
        ? httpReqDuration.avg.toFixed(2)
        : 'N/A';
    const p95ResponseTime =
      httpReqDuration.p95 !== undefined
        ? httpReqDuration.p95.toFixed(2)
        : 'N/A';
    const maxResponseTime =
      httpReqDuration.max !== undefined
        ? httpReqDuration.max.toFixed(2)
        : 'N/A';

    // Taxa de falha
    const httpReqFailed = metrics.http_req_failed || {};
    const failRate =
      httpReqFailed.rate !== undefined
        ? (httpReqFailed.rate * 100).toFixed(2)
        : 'N/A';

    // Requisições por segundo
    const httpReqs = metrics.http_reqs || {};
    const reqsPerSec =
      httpReqs.rate !== undefined ? httpReqs.rate.toFixed(2) : 'N/A';

    // Métricas personalizadas
    const failedRequests = metrics.failed_requests
      ? metrics.failed_requests.count
      : 'N/A';
    const searchTime = metrics.search_time
      ? metrics.search_time.avg.toFixed(2)
      : 'N/A';
    const articleLoadTime = metrics.article_load_time
      ? metrics.article_load_time.avg.toFixed(2)
      : 'N/A';
    const apiResponseTime = metrics.api_response_time
      ? metrics.api_response_time.avg.toFixed(2)
      : 'N/A';

    // Verificar se os thresholds foram atingidos
    const thresholds = results.thresholds || {};
    const thresholdsPassed = Object.values(thresholds).every((t) => t.ok);

    return {
      testName: fileName,
      avgResponseTime,
      p95ResponseTime,
      maxResponseTime,
      failRate,
      reqsPerSec,
      failedRequests,
      searchTime,
      articleLoadTime,
      apiResponseTime,
      thresholdsPassed,
    };
  } catch (error) {
    console.error(`Erro ao analisar o arquivo ${filePath}:`, error.message);
    return null;
  }
}

// Extrair métricas de todos os arquivos
const metricsData = resultFiles.map(extractMetrics).filter(Boolean);

// Gerar HTML
const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Testes de Carga - Rio de Fato</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    header h1 {
      color: white;
      margin: 0;
    }
    .timestamp {
      color: #ddd;
      font-size: 0.9em;
      margin-top: 10px;
    }
    .summary {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .test-results {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    .test-card {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      flex: 1 1 calc(50% - 20px);
      min-width: 300px;
    }
    .test-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .metric {
      margin-bottom: 15px;
    }
    .metric-name {
      font-weight: bold;
      color: #555;
    }
    .metric-value {
      float: right;
      font-weight: bold;
    }
    .good {
      color: #27ae60;
    }
    .warning {
      color: #f39c12;
    }
    .bad {
      color: #e74c3c;
    }
    .threshold-status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      font-weight: bold;
      margin-top: 10px;
    }
    .threshold-passed {
      background-color: #27ae60;
      color: white;
    }
    .threshold-failed {
      background-color: #e74c3c;
      color: white;
    }
    .chart-container {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #2c3e50;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .recommendations {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .recommendation-item {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
    }
    .recommendation-item:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #3498db;
    }
    footer {
      text-align: center;
      margin-top: 30px;
      color: #7f8c8d;
      font-size: 0.9em;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <header>
    <h1>Relatório de Testes de Carga</h1>
    <p>Portal Rio de Fato</p>
    <div class="timestamp">Gerado em: ${new Date().toLocaleString()}</div>
  </header>

  <div class="summary">
    <h2>Resumo dos Testes</h2>
    <p>Diretório de resultados: <strong>${resultsDir}</strong></p>
    <p>Total de testes analisados: <strong>${metricsData.length}</strong></p>
    <p>Testes que passaram nos thresholds: <strong>${metricsData.filter((m) => m.thresholdsPassed).length} de ${metricsData.length}</strong></p>
  </div>

  <div class="chart-container">
    <h2>Comparação de Tempos de Resposta</h2>
    <canvas id="responseTimeChart"></canvas>
  </div>

  <div class="chart-container">
    <h2>Requisições por Segundo</h2>
    <canvas id="reqsPerSecChart"></canvas>
  </div>

  <h2>Resultados Detalhados</h2>
  <div class="test-results">
    ${metricsData
      .map(
        (metrics) => `
      <div class="test-card">
        <h3>${metrics.testName}</h3>
        
        <div class="metric">
          <span class="metric-name">Tempo de Resposta Médio:</span>
          <span class="metric-value ${metrics.avgResponseTime <= 200 ? 'good' : metrics.avgResponseTime <= 500 ? 'warning' : 'bad'}">${metrics.avgResponseTime} ms</span>
        </div>
        
        <div class="metric">
          <span class="metric-name">Tempo de Resposta P95:</span>
          <span class="metric-value ${metrics.p95ResponseTime <= 500 ? 'good' : metrics.p95ResponseTime <= 1000 ? 'warning' : 'bad'}">${metrics.p95ResponseTime} ms</span>
        </div>
        
        <div class="metric">
          <span class="metric-name">Tempo de Resposta Máximo:</span>
          <span class="metric-value">${metrics.maxResponseTime} ms</span>
        </div>
        
        <div class="metric">
          <span class="metric-name">Taxa de Falha:</span>
          <span class="metric-value ${metrics.failRate <= 1 ? 'good' : metrics.failRate <= 5 ? 'warning' : 'bad'}">${metrics.failRate}%</span>
        </div>
        
        <div class="metric">
          <span class="metric-name">Requisições por Segundo:</span>
          <span class="metric-value">${metrics.reqsPerSec} req/s</span>
        </div>
        
        ${
          metrics.searchTime !== 'N/A'
            ? `
        <div class="metric">
          <span class="metric-name">Tempo de Busca:</span>
          <span class="metric-value ${metrics.searchTime <= 300 ? 'good' : metrics.searchTime <= 800 ? 'warning' : 'bad'}">${metrics.searchTime} ms</span>
        </div>
        `
            : ''
        }
        
        ${
          metrics.articleLoadTime !== 'N/A'
            ? `
        <div class="metric">
          <span class="metric-name">Tempo de Carregamento de Artigos:</span>
          <span class="metric-value ${metrics.articleLoadTime <= 300 ? 'good' : metrics.articleLoadTime <= 600 ? 'warning' : 'bad'}">${metrics.articleLoadTime} ms</span>
        </div>
        `
            : ''
        }
        
        ${
          metrics.apiResponseTime !== 'N/A'
            ? `
        <div class="metric">
          <span class="metric-name">Tempo de Resposta da API:</span>
          <span class="metric-value ${metrics.apiResponseTime <= 200 ? 'good' : metrics.apiResponseTime <= 300 ? 'warning' : 'bad'}">${metrics.apiResponseTime} ms</span>
        </div>
        `
            : ''
        }
        
        <div class="threshold-status ${metrics.thresholdsPassed ? 'threshold-passed' : 'threshold-failed'}">
          Thresholds: ${metrics.thresholdsPassed ? 'PASSOU' : 'FALHOU'}
        </div>
      </div>
    `
      )
      .join('')}
  </div>

  <h2>Tabela Comparativa</h2>
  <table>
    <thead>
      <tr>
        <th>Teste</th>
        <th>Tempo Resp. (Médio)</th>
        <th>Tempo Resp. (P95)</th>
        <th>Taxa de Falha</th>
        <th>Req/s</th>
        <th>Thresholds</th>
      </tr>
    </thead>
    <tbody>
      ${metricsData
        .map(
          (metrics) => `
        <tr>
          <td>${metrics.testName}</td>
          <td class="${metrics.avgResponseTime <= 200 ? 'good' : metrics.avgResponseTime <= 500 ? 'warning' : 'bad'}">${metrics.avgResponseTime} ms</td>
          <td class="${metrics.p95ResponseTime <= 500 ? 'good' : metrics.p95ResponseTime <= 1000 ? 'warning' : 'bad'}">${metrics.p95ResponseTime} ms</td>
          <td class="${metrics.failRate <= 1 ? 'good' : metrics.failRate <= 5 ? 'warning' : 'bad'}">${metrics.failRate}%</td>
          <td>${metrics.reqsPerSec} req/s</td>
          <td class="${metrics.thresholdsPassed ? 'good' : 'bad'}">${metrics.thresholdsPassed ? 'PASSOU' : 'FALHOU'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="recommendations">
    <h2>Recomendações</h2>
    
    ${(() => {
      const recommendations = [];

      // Verificar tempos de resposta
      const highResponseTimes = metricsData.filter(
        (m) => parseFloat(m.p95ResponseTime) > 500
      );
      if (highResponseTimes.length > 0) {
        recommendations.push(`
          <div class="recommendation-item">
            <strong>Otimize os tempos de resposta</strong> - ${highResponseTimes.length} teste(s) apresentaram tempos de resposta P95 acima do recomendado (500ms).
            Considere implementar caching, otimizar consultas de banco de dados ou usar CDN para conteúdo estático.
          </div>
        `);
      }

      // Verificar taxas de falha
      const highFailRates = metricsData.filter(
        (m) => parseFloat(m.failRate) > 1
      );
      if (highFailRates.length > 0) {
        recommendations.push(`
          <div class="recommendation-item">
            <strong>Reduza a taxa de falha</strong> - ${highFailRates.length} teste(s) apresentaram taxas de falha acima do aceitável (1%).
            Verifique os logs de erro, implemente mecanismos de retry e verifique a estabilidade das integrações externas.
          </div>
        `);
      }

      // Verificar thresholds
      const failedThresholds = metricsData.filter((m) => !m.thresholdsPassed);
      if (failedThresholds.length > 0) {
        recommendations.push(`
          <div class="recommendation-item">
            <strong>Atenda aos limites de aceitação</strong> - ${failedThresholds.length} teste(s) não atingiram os thresholds definidos.
            Revise os limites ou otimize o sistema para atender aos requisitos de desempenho.
          </div>
        `);
      }

      // Recomendações gerais
      recommendations.push(`
        <div class="recommendation-item">
          <strong>Monitore continuamente</strong> - Implemente monitoramento em produção para detectar problemas de desempenho em tempo real.
        </div>
      `);

      recommendations.push(`
        <div class="recommendation-item">
          <strong>Teste regularmente</strong> - Execute testes de carga periodicamente para verificar se atualizações ou mudanças não afetaram o desempenho.
        </div>
      `);

      return recommendations.join('');
    })()}
  </div>

  <footer>
    <p>Relatório gerado automaticamente pelo sistema de testes de carga do Portal Rio de Fato.</p>
    <p>© ${new Date().getFullYear()} Rio de Fato - Todos os direitos reservados.</p>
  </footer>

  <script>
    // Gráfico de tempos de resposta
    const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
    new Chart(responseTimeCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(metricsData.map((m) => m.testName))},
        datasets: [
          {
            label: 'Tempo de Resposta Médio (ms)',
            data: ${JSON.stringify(metricsData.map((m) => parseFloat(m.avgResponseTime) || 0))},
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Tempo de Resposta P95 (ms)',
            data: ${JSON.stringify(metricsData.map((m) => parseFloat(m.p95ResponseTime) || 0))},
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tempo (ms)'
            }
          }
        }
      }
    });

    // Gráfico de requisições por segundo
    const reqsPerSecCtx = document.getElementById('reqsPerSecChart').getContext('2d');
    new Chart(reqsPerSecCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(metricsData.map((m) => m.testName))},
        datasets: [{
          label: 'Requisições por Segundo',
          data: ${JSON.stringify(metricsData.map((m) => parseFloat(m.reqsPerSec) || 0))},
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Requisições/segundo'
            }
          }
        }
      }
    });
  </script>
</body>
</html>
`;

// Salvar o relatório HTML
const reportPath = path.join(resultsDir, 'relatorio-visual.html');
fs.writeFileSync(reportPath, htmlContent);

console.log(`Relatório visual gerado com sucesso: ${reportPath}`);
console.log(`Abra o arquivo em um navegador para visualizar o relatório.`);
