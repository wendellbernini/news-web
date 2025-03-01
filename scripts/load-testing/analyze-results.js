#!/usr/bin/env node

/**
 * Script para analisar os resultados dos testes de carga
 *
 * Este script lê os arquivos JSON gerados pelos testes de carga
 * e gera um relatório com análises e recomendações.
 *
 * Uso: node analyze-results.js <diretório-de-resultados>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Obter o diretório de resultados da linha de comando
const resultsDir = process.argv[2];

if (!resultsDir) {
  console.error(
    `${colors.red}Erro: Diretório de resultados não especificado.${colors.reset}`
  );
  console.log(
    `${colors.yellow}Uso: node analyze-results.js <diretório-de-resultados>${colors.reset}`
  );
  process.exit(1);
}

if (!fs.existsSync(resultsDir)) {
  console.error(
    `${colors.red}Erro: Diretório '${resultsDir}' não encontrado.${colors.reset}`
  );
  process.exit(1);
}

console.log(
  `${colors.bright}${colors.cyan}=== Análise de Resultados de Testes de Carga ===${colors.reset}\n`
);
console.log(
  `${colors.yellow}Analisando resultados em: ${resultsDir}${colors.reset}\n`
);

// Encontrar arquivos JSON de resultados
const resultFiles = fs
  .readdirSync(resultsDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(resultsDir, file));

if (resultFiles.length === 0) {
  console.error(
    `${colors.red}Erro: Nenhum arquivo de resultado (.json) encontrado em '${resultsDir}'.${colors.reset}`
  );
  process.exit(1);
}

console.log(
  `${colors.green}Encontrados ${resultFiles.length} arquivos de resultados.${colors.reset}\n`
);

// Função para analisar um arquivo de resultados
function analyzeResultFile(filePath) {
  const fileName = path.basename(filePath);
  const testName = fileName.replace('.json', '');

  console.log(
    `${colors.bright}${colors.blue}Analisando: ${testName}${colors.reset}`
  );

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = JSON.parse(fileContent);

    // Extrair métricas relevantes
    const metrics = results.metrics || {};

    // Analisar tempo de resposta
    const httpReqDuration = metrics.http_req_duration || {};
    const avgResponseTime =
      httpReqDuration.avg !== undefined
        ? httpReqDuration.avg.toFixed(2)
        : 'N/A';
    const p95ResponseTime =
      httpReqDuration.p(95) !== undefined
        ? httpReqDuration.p(95).toFixed(2)
        : 'N/A';
    const maxResponseTime =
      httpReqDuration.max !== undefined
        ? httpReqDuration.max.toFixed(2)
        : 'N/A';

    console.log(`${colors.cyan}Tempo de Resposta:${colors.reset}`);
    console.log(`  Médio: ${avgResponseTime} ms`);
    console.log(`  P95: ${p95ResponseTime} ms`);
    console.log(`  Máximo: ${maxResponseTime} ms`);

    // Analisar taxa de falha
    const httpReqFailed = metrics.http_req_failed || {};
    const failRate =
      httpReqFailed.rate !== undefined
        ? (httpReqFailed.rate * 100).toFixed(2)
        : 'N/A';

    console.log(`${colors.cyan}Taxa de Falha:${colors.reset}`);
    console.log(`  ${failRate}%`);

    // Analisar requisições por segundo
    const httpReqs = metrics.http_reqs || {};
    const reqsPerSec =
      httpReqs.rate !== undefined ? httpReqs.rate.toFixed(2) : 'N/A';

    console.log(`${colors.cyan}Requisições por Segundo:${colors.reset}`);
    console.log(`  ${reqsPerSec} req/s`);

    // Analisar métricas personalizadas
    if (metrics.failed_requests) {
      console.log(
        `${colors.cyan}Requisições Falhas (verificações):${colors.reset}`
      );
      console.log(`  ${metrics.failed_requests.count || 'N/A'}`);
    }

    if (metrics.search_time) {
      console.log(`${colors.cyan}Tempo de Busca:${colors.reset}`);
      console.log(
        `  Médio: ${metrics.search_time.avg ? metrics.search_time.avg.toFixed(2) : 'N/A'} ms`
      );
      console.log(
        `  P95: ${metrics.search_time.p95 ? metrics.search_time.p95.toFixed(2) : 'N/A'} ms`
      );
    }

    if (metrics.article_load_time) {
      console.log(
        `${colors.cyan}Tempo de Carregamento de Artigos:${colors.reset}`
      );
      console.log(
        `  Médio: ${metrics.article_load_time.avg ? metrics.article_load_time.avg.toFixed(2) : 'N/A'} ms`
      );
      console.log(
        `  P95: ${metrics.article_load_time.p95 ? metrics.article_load_time.p95.toFixed(2) : 'N/A'} ms`
      );
    }

    if (metrics.api_response_time) {
      console.log(`${colors.cyan}Tempo de Resposta da API:${colors.reset}`);
      console.log(
        `  Médio: ${metrics.api_response_time.avg ? metrics.api_response_time.avg.toFixed(2) : 'N/A'} ms`
      );
      console.log(
        `  P95: ${metrics.api_response_time.p95 ? metrics.api_response_time.p95.toFixed(2) : 'N/A'} ms`
      );
    }

    // Verificar se os thresholds foram atingidos
    const thresholds = results.thresholds || {};
    const thresholdsPassed = Object.values(thresholds).every((t) => t.ok);

    console.log(`${colors.cyan}Thresholds:${colors.reset}`);
    console.log(
      `  ${thresholdsPassed ? colors.green + 'PASSOU' : colors.red + 'FALHOU'}${colors.reset}`
    );

    // Gerar recomendações com base nos resultados
    console.log(`${colors.cyan}Recomendações:${colors.reset}`);

    if (p95ResponseTime > 500) {
      console.log(
        `  ${colors.yellow}• O tempo de resposta P95 (${p95ResponseTime} ms) está acima do recomendado (500 ms).${colors.reset}`
      );
      console.log(
        `    Considere otimizar consultas de banco de dados, implementar caching ou escalar a infraestrutura.`
      );
    }

    if (failRate > 1) {
      console.log(
        `  ${colors.yellow}• A taxa de falha (${failRate}%) está acima do aceitável (1%).${colors.reset}`
      );
      console.log(
        `    Verifique os logs de erro para identificar a causa das falhas.`
      );
    }

    if (reqsPerSec < 10) {
      console.log(
        `  ${colors.yellow}• A taxa de requisições por segundo (${reqsPerSec}) está abaixo do esperado.${colors.reset}`
      );
      console.log(`    Verifique se há gargalos no servidor ou na rede.`);
    }

    if (metrics.search_time && metrics.search_time.p95 > 800) {
      console.log(
        `  ${colors.yellow}• O tempo de busca P95 (${metrics.search_time.p95.toFixed(2)} ms) está alto.${colors.reset}`
      );
      console.log(
        `    Considere otimizar o mecanismo de busca ou implementar indexação.`
      );
    }

    if (metrics.article_load_time && metrics.article_load_time.p95 > 600) {
      console.log(
        `  ${colors.yellow}• O tempo de carregamento de artigos P95 (${metrics.article_load_time.p95.toFixed(2)} ms) está alto.${colors.reset}`
      );
      console.log(
        `    Considere otimizar o carregamento de conteúdo ou implementar lazy loading.`
      );
    }

    if (metrics.api_response_time && metrics.api_response_time.p95 > 300) {
      console.log(
        `  ${colors.yellow}• O tempo de resposta da API P95 (${metrics.api_response_time.p95.toFixed(2)} ms) está alto.${colors.reset}`
      );
      console.log(
        `    Considere otimizar os endpoints da API ou implementar caching.`
      );
    }

    if (thresholdsPassed && avgResponseTime < 200 && failRate < 0.1) {
      console.log(
        `  ${colors.green}• O desempenho geral está bom. Continue monitorando regularmente.${colors.reset}`
      );
    }

    console.log('');

    return {
      testName,
      avgResponseTime,
      p95ResponseTime,
      maxResponseTime,
      failRate,
      reqsPerSec,
      thresholdsPassed,
    };
  } catch (error) {
    console.error(
      `${colors.red}Erro ao analisar o arquivo ${fileName}:${colors.reset}`,
      error.message
    );
    return null;
  }
}

// Analisar todos os arquivos de resultados
const analysisResults = resultFiles.map(analyzeResultFile).filter(Boolean);

// Gerar relatório resumido
console.log(
  `${colors.bright}${colors.cyan}=== Resumo da Análise ===${colors.reset}\n`
);

// Tabela de resumo
console.log(
  `${colors.bright}Teste               | Tempo Resp. (P95) | Taxa Falha | Req/s  | Thresholds${colors.reset}`
);
console.log(
  `--------------------|-------------------|------------|--------|----------`
);

analysisResults.forEach((result) => {
  const testName = result.testName.padEnd(18).substring(0, 18);
  const p95ResponseTime = result.p95ResponseTime.padEnd(17).substring(0, 17);
  const failRate = result.failRate.padEnd(10).substring(0, 10);
  const reqsPerSec = result.reqsPerSec.padEnd(6).substring(0, 6);
  const thresholds = result.thresholdsPassed
    ? `${colors.green}PASSOU${colors.reset}`
    : `${colors.red}FALHOU${colors.reset}`;

  console.log(
    `${testName} | ${p95ResponseTime} | ${failRate} | ${reqsPerSec} | ${thresholds}`
  );
});

console.log('');

// Conclusão geral
const allThresholdsPassed = analysisResults.every((r) => r.thresholdsPassed);
const avgP95ResponseTime =
  analysisResults.reduce((sum, r) => sum + parseFloat(r.p95ResponseTime), 0) /
  analysisResults.length;
const avgFailRate =
  analysisResults.reduce((sum, r) => sum + parseFloat(r.failRate), 0) /
  analysisResults.length;

console.log(
  `${colors.bright}${colors.cyan}=== Conclusão Geral ===${colors.reset}\n`
);

if (allThresholdsPassed && avgP95ResponseTime < 500 && avgFailRate < 1) {
  console.log(
    `${colors.green}O sistema apresenta bom desempenho sob carga. Todos os testes passaram nos limites definidos.${colors.reset}`
  );
  console.log(
    `Tempo médio de resposta P95: ${avgP95ResponseTime.toFixed(2)} ms`
  );
  console.log(`Taxa média de falha: ${avgFailRate.toFixed(2)}%`);
} else if (avgP95ResponseTime < 1000 && avgFailRate < 5) {
  console.log(
    `${colors.yellow}O sistema apresenta desempenho aceitável, mas há espaço para melhorias.${colors.reset}`
  );
  console.log(
    `Tempo médio de resposta P95: ${avgP95ResponseTime.toFixed(2)} ms`
  );
  console.log(`Taxa média de falha: ${avgFailRate.toFixed(2)}%`);
} else {
  console.log(
    `${colors.red}O sistema apresenta problemas de desempenho sob carga. Recomenda-se otimizações antes do lançamento.${colors.reset}`
  );
  console.log(
    `Tempo médio de resposta P95: ${avgP95ResponseTime.toFixed(2)} ms`
  );
  console.log(`Taxa média de falha: ${avgFailRate.toFixed(2)}%`);
}

console.log('');

// Verificar se há logs de monitoramento de recursos
const resourcesDir = resultsDir.replace(/\/[^\/]+$/, '-resources');
if (fs.existsSync(resourcesDir)) {
  console.log(
    `${colors.bright}${colors.cyan}=== Análise de Recursos do Servidor ===${colors.reset}\n`
  );
  console.log(
    `${colors.yellow}Logs de monitoramento encontrados em: ${resourcesDir}${colors.reset}\n`
  );

  // Analisar CPU
  const cpuLogPath = path.join(resourcesDir, 'cpu.log');
  if (fs.existsSync(cpuLogPath)) {
    console.log(`${colors.cyan}Análise de CPU:${colors.reset}`);
    try {
      // Extrair informações de CPU usando grep e awk
      const cpuUsage = execSync(
        `grep "%Cpu(s)" "${cpuLogPath}" | awk '{print $2}' | sort -n | tail -1`
      )
        .toString()
        .trim();
      console.log(`  Pico de uso de CPU: ${cpuUsage}%`);

      if (parseFloat(cpuUsage) > 80) {
        console.log(
          `  ${colors.yellow}• O uso de CPU atingiu níveis altos (${cpuUsage}%).${colors.reset}`
        );
        console.log(
          `    Considere otimizar o código ou escalar verticalmente (mais CPU).`
        );
      }
    } catch (error) {
      console.log(`  Não foi possível analisar o log de CPU.`);
    }
  }

  // Analisar memória
  const memoryLogPath = path.join(resourcesDir, 'memory.log');
  if (fs.existsSync(memoryLogPath)) {
    console.log(`${colors.cyan}Análise de Memória:${colors.reset}`);
    try {
      // Extrair informações de memória usando grep e awk
      const freeMemory = execSync(
        `grep -v "procs" "${memoryLogPath}" | awk '{print $4}' | sort -n | head -1`
      )
        .toString()
        .trim();
      console.log(`  Memória livre mínima: ${freeMemory} KB`);

      if (parseInt(freeMemory) < 1024 * 100) {
        // Menos de 100 MB
        console.log(
          `  ${colors.yellow}• A memória livre chegou a níveis baixos (${Math.round(parseInt(freeMemory) / 1024)} MB).${colors.reset}`
        );
        console.log(
          `    Considere otimizar o uso de memória ou aumentar a RAM disponível.`
        );
      }
    } catch (error) {
      console.log(`  Não foi possível analisar o log de memória.`);
    }
  }

  console.log('');
}

// Recomendações finais
console.log(
  `${colors.bright}${colors.cyan}=== Recomendações Finais ===${colors.reset}\n`
);

if (allThresholdsPassed && avgP95ResponseTime < 500 && avgFailRate < 1) {
  console.log(
    `${colors.green}O sistema está pronto para o lançamento com base nos testes realizados.${colors.reset}`
  );
  console.log(`Recomendações para manter o bom desempenho:`);
  console.log(`1. Continue monitorando o desempenho após o lançamento.`);
  console.log(
    `2. Implemente um sistema de alerta para detectar degradações de desempenho.`
  );
  console.log(
    `3. Realize testes de carga periodicamente para garantir que o sistema continua performando bem.`
  );
} else {
  console.log(
    `${colors.yellow}Recomendações antes do lançamento:${colors.reset}`
  );

  if (avgP95ResponseTime >= 500) {
    console.log(
      `1. Otimize o tempo de resposta (atual: ${avgP95ResponseTime.toFixed(2)} ms, alvo: <500 ms).`
    );
    console.log(`   - Implemente ou ajuste estratégias de cache.`);
    console.log(`   - Otimize consultas de banco de dados.`);
    console.log(`   - Considere usar CDN para conteúdo estático.`);
  }

  if (avgFailRate >= 1) {
    console.log(
      `2. Reduza a taxa de falha (atual: ${avgFailRate.toFixed(2)}%, alvo: <1%).`
    );
    console.log(`   - Identifique e corrija erros nos logs.`);
    console.log(
      `   - Implemente retry mechanisms para operações que podem falhar.`
    );
    console.log(`   - Verifique a estabilidade das integrações externas.`);
  }

  console.log(`3. Considere escalar a infraestrutura:`);
  console.log(`   - Vertical: Aumente CPU/RAM dos servidores existentes.`);
  console.log(
    `   - Horizontal: Adicione mais instâncias e use balanceamento de carga.`
  );

  console.log(
    `4. Após implementar as otimizações, execute os testes novamente para verificar melhorias.`
  );
}

console.log('');
console.log(
  `${colors.bright}${colors.cyan}=== Fim da Análise ===${colors.reset}`
);

// Gerar arquivo de relatório
const reportPath = path.join(resultsDir, 'analise-detalhada.txt');
const reportContent = `
=== ANÁLISE DETALHADA DOS TESTES DE CARGA ===
Data: ${new Date().toLocaleString()}
Diretório de resultados: ${resultsDir}

=== RESUMO ===
Tempo médio de resposta P95: ${avgP95ResponseTime.toFixed(2)} ms
Taxa média de falha: ${avgFailRate.toFixed(2)}%
Status geral: ${allThresholdsPassed ? 'PASSOU' : 'FALHOU'}

=== RECOMENDAÇÕES ===
${
  allThresholdsPassed && avgP95ResponseTime < 500 && avgFailRate < 1
    ? 'O sistema está pronto para o lançamento com base nos testes realizados.'
    : 'Há otimizações recomendadas antes do lançamento. Veja o relatório completo para detalhes.'
}

Para mais detalhes, consulte os arquivos de resultados individuais.
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`\nRelatório salvo em: ${reportPath}`);
