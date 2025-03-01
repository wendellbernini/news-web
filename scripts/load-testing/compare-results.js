#!/usr/bin/env node

/**
 * Script para comparar resultados de diferentes execuções de testes de carga
 *
 * Este script compara os resultados de duas execuções diferentes de testes de carga
 * e gera um relatório mostrando as diferenças e melhorias/regressões.
 *
 * Uso: node compare-results.js <diretório-base> <diretório-comparação>
 */

const fs = require('fs');
const path = require('path');

// Cores para saída no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Obter os diretórios de resultados da linha de comando
const baseDir = process.argv[2];
const compareDir = process.argv[3];

if (!baseDir || !compareDir) {
  console.error(
    `${colors.red}Erro: Diretórios de resultados não especificados.${colors.reset}`
  );
  console.log(
    `${colors.yellow}Uso: node compare-results.js <diretório-base> <diretório-comparação>${colors.reset}`
  );
  process.exit(1);
}

if (!fs.existsSync(baseDir)) {
  console.error(
    `${colors.red}Erro: Diretório base '${baseDir}' não encontrado.${colors.reset}`
  );
  process.exit(1);
}

if (!fs.existsSync(compareDir)) {
  console.error(
    `${colors.red}Erro: Diretório de comparação '${compareDir}' não encontrado.${colors.reset}`
  );
  process.exit(1);
}

console.log(
  `${colors.bright}${colors.cyan}=== Comparação de Resultados de Testes de Carga ===${colors.reset}\n`
);
console.log(`${colors.yellow}Comparando resultados:${colors.reset}`);
console.log(`Base: ${baseDir}`);
console.log(`Comparação: ${compareDir}\n`);

// Encontrar arquivos JSON de resultados em ambos os diretórios
const baseFiles = fs
  .readdirSync(baseDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({ name: file, path: path.join(baseDir, file) }));

const compareFiles = fs
  .readdirSync(compareDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({ name: file, path: path.join(compareDir, file) }));

if (baseFiles.length === 0) {
  console.error(
    `${colors.red}Erro: Nenhum arquivo de resultado (.json) encontrado em '${baseDir}'.${colors.reset}`
  );
  process.exit(1);
}

if (compareFiles.length === 0) {
  console.error(
    `${colors.red}Erro: Nenhum arquivo de resultado (.json) encontrado em '${compareDir}'.${colors.reset}`
  );
  process.exit(1);
}

console.log(
  `${colors.green}Encontrados ${baseFiles.length} arquivos no diretório base.${colors.reset}`
);
console.log(
  `${colors.green}Encontrados ${compareFiles.length} arquivos no diretório de comparação.${colors.reset}\n`
);

// Função para extrair métricas de um arquivo de resultados
function extractMetrics(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = JSON.parse(fileContent);

    // Extrair métricas relevantes
    const metrics = results.metrics || {};

    // Tempo de resposta
    const httpReqDuration = metrics.http_req_duration || {};
    const avgResponseTime =
      httpReqDuration.avg !== undefined ? httpReqDuration.avg : null;
    const p95ResponseTime =
      httpReqDuration.p95 !== undefined ? httpReqDuration.p95 : null;
    const maxResponseTime =
      httpReqDuration.max !== undefined ? httpReqDuration.max : null;

    // Taxa de falha
    const httpReqFailed = metrics.http_req_failed || {};
    const failRate =
      httpReqFailed.rate !== undefined ? httpReqFailed.rate * 100 : null;

    // Requisições por segundo
    const httpReqs = metrics.http_reqs || {};
    const reqsPerSec = httpReqs.rate !== undefined ? httpReqs.rate : null;

    // Métricas personalizadas
    const failedRequests = metrics.failed_requests
      ? metrics.failed_requests.count
      : null;
    const searchTime = metrics.search_time ? metrics.search_time.avg : null;
    const articleLoadTime = metrics.article_load_time
      ? metrics.article_load_time.avg
      : null;
    const apiResponseTime = metrics.api_response_time
      ? metrics.api_response_time.avg
      : null;

    // Verificar se os thresholds foram atingidos
    const thresholds = results.thresholds || {};
    const thresholdsPassed = Object.values(thresholds).every((t) => t.ok);

    return {
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
    console.error(
      `${colors.red}Erro ao analisar o arquivo ${filePath}:${colors.reset}`,
      error.message
    );
    return null;
  }
}

// Função para calcular a diferença percentual entre dois valores
function percentDiff(base, compare) {
  if (base === null || compare === null) return null;
  return ((compare - base) / base) * 100;
}

// Função para formatar a diferença percentual com cores
function formatPercentDiff(diff, inverse = false) {
  if (diff === null) return 'N/A';

  const formatted = diff.toFixed(2) + '%';

  // Para métricas onde menor é melhor (tempo de resposta, taxa de falha)
  if (!inverse) {
    if (diff < 0) return `${colors.green}${formatted} ↓${colors.reset}`;
    if (diff > 0) return `${colors.red}${formatted} ↑${colors.reset}`;
    return `${colors.yellow}${formatted} =${colors.reset}`;
  }
  // Para métricas onde maior é melhor (requisições por segundo)
  else {
    if (diff > 0) return `${colors.green}${formatted} ↑${colors.reset}`;
    if (diff < 0) return `${colors.red}${formatted} ↓${colors.reset}`;
    return `${colors.yellow}${formatted} =${colors.reset}`;
  }
}

// Comparar arquivos com o mesmo nome
const comparisons = [];

baseFiles.forEach((baseFile) => {
  const matchingCompareFile = compareFiles.find(
    (f) => f.name === baseFile.name
  );

  if (matchingCompareFile) {
    const testName = baseFile.name.replace('.json', '');
    console.log(
      `${colors.bright}${colors.blue}Comparando: ${testName}${colors.reset}`
    );

    const baseMetrics = extractMetrics(baseFile.path);
    const compareMetrics = extractMetrics(matchingCompareFile.path);

    if (baseMetrics && compareMetrics) {
      // Calcular diferenças
      const avgResponseTimeDiff = percentDiff(
        baseMetrics.avgResponseTime,
        compareMetrics.avgResponseTime
      );
      const p95ResponseTimeDiff = percentDiff(
        baseMetrics.p95ResponseTime,
        compareMetrics.p95ResponseTime
      );
      const maxResponseTimeDiff = percentDiff(
        baseMetrics.maxResponseTime,
        compareMetrics.maxResponseTime
      );
      const failRateDiff = percentDiff(
        baseMetrics.failRate,
        compareMetrics.failRate
      );
      const reqsPerSecDiff = percentDiff(
        baseMetrics.reqsPerSec,
        compareMetrics.reqsPerSec
      );
      const failedRequestsDiff = percentDiff(
        baseMetrics.failedRequests,
        compareMetrics.failedRequests
      );
      const searchTimeDiff = percentDiff(
        baseMetrics.searchTime,
        compareMetrics.searchTime
      );
      const articleLoadTimeDiff = percentDiff(
        baseMetrics.articleLoadTime,
        compareMetrics.articleLoadTime
      );
      const apiResponseTimeDiff = percentDiff(
        baseMetrics.apiResponseTime,
        compareMetrics.apiResponseTime
      );

      // Exibir comparação
      console.log(`${colors.cyan}Tempo de Resposta Médio:${colors.reset}`);
      console.log(
        `  Base: ${baseMetrics.avgResponseTime ? baseMetrics.avgResponseTime.toFixed(2) : 'N/A'} ms`
      );
      console.log(
        `  Comparação: ${compareMetrics.avgResponseTime ? compareMetrics.avgResponseTime.toFixed(2) : 'N/A'} ms`
      );
      console.log(`  Diferença: ${formatPercentDiff(avgResponseTimeDiff)}`);

      console.log(`${colors.cyan}Tempo de Resposta P95:${colors.reset}`);
      console.log(
        `  Base: ${baseMetrics.p95ResponseTime ? baseMetrics.p95ResponseTime.toFixed(2) : 'N/A'} ms`
      );
      console.log(
        `  Comparação: ${compareMetrics.p95ResponseTime ? compareMetrics.p95ResponseTime.toFixed(2) : 'N/A'} ms`
      );
      console.log(`  Diferença: ${formatPercentDiff(p95ResponseTimeDiff)}`);

      console.log(`${colors.cyan}Taxa de Falha:${colors.reset}`);
      console.log(
        `  Base: ${baseMetrics.failRate ? baseMetrics.failRate.toFixed(2) : 'N/A'}%`
      );
      console.log(
        `  Comparação: ${compareMetrics.failRate ? compareMetrics.failRate.toFixed(2) : 'N/A'}%`
      );
      console.log(`  Diferença: ${formatPercentDiff(failRateDiff)}`);

      console.log(`${colors.cyan}Requisições por Segundo:${colors.reset}`);
      console.log(
        `  Base: ${baseMetrics.reqsPerSec ? baseMetrics.reqsPerSec.toFixed(2) : 'N/A'} req/s`
      );
      console.log(
        `  Comparação: ${compareMetrics.reqsPerSec ? compareMetrics.reqsPerSec.toFixed(2) : 'N/A'} req/s`
      );
      console.log(`  Diferença: ${formatPercentDiff(reqsPerSecDiff, true)}`);

      if (
        baseMetrics.searchTime !== null ||
        compareMetrics.searchTime !== null
      ) {
        console.log(`${colors.cyan}Tempo de Busca:${colors.reset}`);
        console.log(
          `  Base: ${baseMetrics.searchTime ? baseMetrics.searchTime.toFixed(2) : 'N/A'} ms`
        );
        console.log(
          `  Comparação: ${compareMetrics.searchTime ? compareMetrics.searchTime.toFixed(2) : 'N/A'} ms`
        );
        console.log(`  Diferença: ${formatPercentDiff(searchTimeDiff)}`);
      }

      if (
        baseMetrics.articleLoadTime !== null ||
        compareMetrics.articleLoadTime !== null
      ) {
        console.log(
          `${colors.cyan}Tempo de Carregamento de Artigos:${colors.reset}`
        );
        console.log(
          `  Base: ${baseMetrics.articleLoadTime ? baseMetrics.articleLoadTime.toFixed(2) : 'N/A'} ms`
        );
        console.log(
          `  Comparação: ${compareMetrics.articleLoadTime ? compareMetrics.articleLoadTime.toFixed(2) : 'N/A'} ms`
        );
        console.log(`  Diferença: ${formatPercentDiff(articleLoadTimeDiff)}`);
      }

      if (
        baseMetrics.apiResponseTime !== null ||
        compareMetrics.apiResponseTime !== null
      ) {
        console.log(`${colors.cyan}Tempo de Resposta da API:${colors.reset}`);
        console.log(
          `  Base: ${baseMetrics.apiResponseTime ? baseMetrics.apiResponseTime.toFixed(2) : 'N/A'} ms`
        );
        console.log(
          `  Comparação: ${compareMetrics.apiResponseTime ? compareMetrics.apiResponseTime.toFixed(2) : 'N/A'} ms`
        );
        console.log(`  Diferença: ${formatPercentDiff(apiResponseTimeDiff)}`);
      }

      console.log(`${colors.cyan}Thresholds:${colors.reset}`);
      console.log(
        `  Base: ${baseMetrics.thresholdsPassed ? colors.green + 'PASSOU' : colors.red + 'FALHOU'}${colors.reset}`
      );
      console.log(
        `  Comparação: ${compareMetrics.thresholdsPassed ? colors.green + 'PASSOU' : colors.red + 'FALHOU'}${colors.reset}`
      );

      // Adicionar à lista de comparações
      comparisons.push({
        testName,
        baseMetrics,
        compareMetrics,
        diffs: {
          avgResponseTime: avgResponseTimeDiff,
          p95ResponseTime: p95ResponseTimeDiff,
          maxResponseTime: maxResponseTimeDiff,
          failRate: failRateDiff,
          reqsPerSec: reqsPerSecDiff,
          failedRequests: failedRequestsDiff,
          searchTime: searchTimeDiff,
          articleLoadTime: articleLoadTimeDiff,
          apiResponseTime: apiResponseTimeDiff,
        },
      });

      console.log('');
    }
  } else {
    console.log(
      `${colors.yellow}Aviso: Não foi encontrado arquivo correspondente para ${baseFile.name} no diretório de comparação.${colors.reset}\n`
    );
  }
});

// Verificar arquivos no diretório de comparação que não existem no diretório base
compareFiles.forEach((compareFile) => {
  const matchingBaseFile = baseFiles.find((f) => f.name === compareFile.name);

  if (!matchingBaseFile) {
    console.log(
      `${colors.yellow}Aviso: Arquivo ${compareFile.name} existe apenas no diretório de comparação.${colors.reset}\n`
    );
  }
});

// Gerar resumo da comparação
if (comparisons.length > 0) {
  console.log(
    `${colors.bright}${colors.cyan}=== Resumo da Comparação ===${colors.reset}\n`
  );

  // Tabela de resumo
  console.log(
    `${colors.bright}Teste               | Tempo Resp. (P95) | Taxa Falha | Req/s  | Thresholds${colors.reset}`
  );
  console.log(
    `--------------------|-------------------|------------|--------|----------`
  );

  comparisons.forEach((comparison) => {
    const testName = comparison.testName.padEnd(18).substring(0, 18);
    const p95Diff = formatPercentDiff(comparison.diffs.p95ResponseTime)
      .padEnd(17)
      .substring(0, 17);
    const failRateDiff = formatPercentDiff(comparison.diffs.failRate)
      .padEnd(10)
      .substring(0, 10);
    const reqsPerSecDiff = formatPercentDiff(comparison.diffs.reqsPerSec, true)
      .padEnd(6)
      .substring(0, 6);

    const baseThreshold = comparison.baseMetrics.thresholdsPassed;
    const compareThreshold = comparison.compareMetrics.thresholdsPassed;
    let thresholdStatus;

    if (!baseThreshold && compareThreshold) {
      thresholdStatus = `${colors.green}MELHOROU${colors.reset}`;
    } else if (baseThreshold && !compareThreshold) {
      thresholdStatus = `${colors.red}PIOROU${colors.reset}`;
    } else {
      thresholdStatus = `${colors.yellow}IGUAL${colors.reset}`;
    }

    console.log(
      `${testName} | ${p95Diff} | ${failRateDiff} | ${reqsPerSecDiff} | ${thresholdStatus}`
    );
  });

  console.log('');

  // Calcular médias das diferenças
  const avgP95Diff =
    comparisons.reduce((sum, c) => sum + (c.diffs.p95ResponseTime || 0), 0) /
    comparisons.length;
  const avgFailRateDiff =
    comparisons.reduce((sum, c) => sum + (c.diffs.failRate || 0), 0) /
    comparisons.length;
  const avgReqsPerSecDiff =
    comparisons.reduce((sum, c) => sum + (c.diffs.reqsPerSec || 0), 0) /
    comparisons.length;

  // Conclusão geral
  console.log(
    `${colors.bright}${colors.cyan}=== Conclusão Geral ===${colors.reset}\n`
  );

  if (avgP95Diff < -10 && avgFailRateDiff < -10 && avgReqsPerSecDiff > 10) {
    console.log(
      `${colors.green}Melhoria significativa de desempenho detectada!${colors.reset}`
    );
    console.log(
      `Tempo médio de resposta P95: ${formatPercentDiff(avgP95Diff)}`
    );
    console.log(`Taxa média de falha: ${formatPercentDiff(avgFailRateDiff)}`);
    console.log(
      `Requisições por segundo: ${formatPercentDiff(avgReqsPerSecDiff, true)}`
    );
  } else if (
    avgP95Diff > 10 &&
    avgFailRateDiff > 10 &&
    avgReqsPerSecDiff < -10
  ) {
    console.log(
      `${colors.red}Regressão significativa de desempenho detectada!${colors.reset}`
    );
    console.log(
      `Tempo médio de resposta P95: ${formatPercentDiff(avgP95Diff)}`
    );
    console.log(`Taxa média de falha: ${formatPercentDiff(avgFailRateDiff)}`);
    console.log(
      `Requisições por segundo: ${formatPercentDiff(avgReqsPerSecDiff, true)}`
    );
  } else {
    console.log(
      `${colors.yellow}Alterações de desempenho mistas ou não significativas.${colors.reset}`
    );
    console.log(
      `Tempo médio de resposta P95: ${formatPercentDiff(avgP95Diff)}`
    );
    console.log(`Taxa média de falha: ${formatPercentDiff(avgFailRateDiff)}`);
    console.log(
      `Requisições por segundo: ${formatPercentDiff(avgReqsPerSecDiff, true)}`
    );
  }

  console.log('');

  // Recomendações
  console.log(
    `${colors.bright}${colors.cyan}=== Recomendações ===${colors.reset}\n`
  );

  if (avgP95Diff > 0) {
    console.log(
      `${colors.yellow}• O tempo de resposta aumentou. Considere investigar as causas.${colors.reset}`
    );
    console.log(
      `  - Verifique alterações recentes no código que possam ter afetado o desempenho.`
    );
    console.log(
      `  - Analise consultas de banco de dados que possam ter se tornado mais lentas.`
    );
    console.log(
      `  - Verifique se houve mudanças na infraestrutura ou configuração.`
    );
  }

  if (avgFailRateDiff > 0) {
    console.log(
      `${colors.yellow}• A taxa de falha aumentou. Considere investigar as causas.${colors.reset}`
    );
    console.log(
      `  - Verifique os logs de erro para identificar novos tipos de falhas.`
    );
    console.log(`  - Analise integrações externas que possam estar falhando.`);
    console.log(
      `  - Verifique se há problemas de concorrência ou race conditions.`
    );
  }

  if (avgReqsPerSecDiff < 0) {
    console.log(
      `${colors.yellow}• A capacidade de processamento diminuiu. Considere investigar as causas.${colors.reset}`
    );
    console.log(`  - Verifique se há novos gargalos no sistema.`);
    console.log(`  - Analise o uso de recursos (CPU, memória, disco, rede).`);
    console.log(`  - Considere otimizações ou escalabilidade adicional.`);
  }

  if (avgP95Diff < 0 && avgFailRateDiff < 0 && avgReqsPerSecDiff > 0) {
    console.log(
      `${colors.green}• As otimizações realizadas tiveram um impacto positivo no desempenho.${colors.reset}`
    );
    console.log(
      `  - Continue monitorando o desempenho para garantir que as melhorias sejam mantidas.`
    );
    console.log(
      `  - Documente as alterações que levaram às melhorias para referência futura.`
    );
    console.log(
      `  - Considere aplicar estratégias semelhantes em outras áreas do sistema.`
    );
  }

  console.log('');
  console.log(
    `${colors.bright}${colors.cyan}=== Fim da Comparação ===${colors.reset}`
  );

  // Gerar arquivo de relatório
  const reportDir = path.dirname(baseDir);
  const reportPath = path.join(reportDir, 'comparacao-resultados.txt');
  const reportContent = `
=== COMPARAÇÃO DE RESULTADOS DE TESTES DE CARGA ===
Data: ${new Date().toLocaleString()}
Diretório base: ${baseDir}
Diretório de comparação: ${compareDir}

=== RESUMO ===
Diferença média no tempo de resposta P95: ${avgP95Diff.toFixed(2)}%
Diferença média na taxa de falha: ${avgFailRateDiff.toFixed(2)}%
Diferença média nas requisições por segundo: ${avgReqsPerSecDiff.toFixed(2)}%

=== CONCLUSÃO ===
${
  avgP95Diff < -10 && avgFailRateDiff < -10 && avgReqsPerSecDiff > 10
    ? 'Melhoria significativa de desempenho detectada!'
    : avgP95Diff > 10 && avgFailRateDiff > 10 && avgReqsPerSecDiff < -10
      ? 'Regressão significativa de desempenho detectada!'
      : 'Alterações de desempenho mistas ou não significativas.'
}

Para mais detalhes, consulte os arquivos de resultados individuais.
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nRelatório salvo em: ${reportPath}`);
} else {
  console.log(
    `${colors.yellow}Nenhuma comparação foi possível. Verifique se os arquivos têm os mesmos nomes em ambos os diretórios.${colors.reset}`
  );
}
