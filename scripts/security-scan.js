#!/usr/bin/env node

/**
 * Script para realizar testes de segurança básicos no site
 * Este script verifica:
 * 1. Headers de segurança
 * 2. Rate limiting
 * 3. Vulnerabilidades comuns (XSS, CSRF, etc.)
 * 4. Configurações de CORS
 *
 * Uso: node scripts/security-scan.js [url]
 * Exemplo: node scripts/security-scan.js http://localhost:3000
 */

const fetch = require('node-fetch');
const { URL } = require('url');
const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configurações
const DEFAULT_URL = 'http://localhost:3000';
const ENDPOINTS_TO_TEST = [
  '/',
  '/api/auth/check-admin',
  '/api/v1/news',
  '/login',
  '/admin',
];
const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '"><script>alert(1)</script>',
  "'><script>alert(1)</script>",
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
];
const RATE_LIMIT_REQUESTS = 20;

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Função para imprimir mensagens coloridas
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Função para imprimir resultados de testes
function logResult(test, result, details = '') {
  const color = result ? colors.green : colors.red;
  const status = result ? 'PASSOU' : 'FALHOU';
  console.log(
    `${color}[${status}]${colors.reset} ${test}${details ? ` - ${details}` : ''}`
  );
}

// Função para verificar headers de segurança
async function checkSecurityHeaders(url) {
  log('\n=== Verificando Headers de Segurança ===', colors.cyan);

  try {
    const response = await fetch(url);
    const headers = response.headers;

    // Headers de segurança importantes
    const securityHeaders = {
      'X-XSS-Protection': { value: '1; mode=block', required: true },
      'X-Content-Type-Options': { value: 'nosniff', required: true },
      'X-Frame-Options': { value: ['DENY', 'SAMEORIGIN'], required: true },
      'Content-Security-Policy': { value: null, required: true },
      'Strict-Transport-Security': {
        value: null,
        required: url.startsWith('https'),
      },
      'Referrer-Policy': { value: null, required: true },
    };

    let allHeadersPresent = true;

    for (const [header, config] of Object.entries(securityHeaders)) {
      const headerValue = headers.get(header);
      const hasHeader = headerValue !== null;

      if (config.required) {
        if (!hasHeader) {
          logResult(`Header ${header}`, false, 'Ausente');
          allHeadersPresent = false;
        } else if (config.value) {
          const validValue = Array.isArray(config.value)
            ? config.value.includes(headerValue)
            : headerValue === config.value;

          if (validValue) {
            logResult(`Header ${header}`, true, headerValue);
          } else {
            logResult(
              `Header ${header}`,
              false,
              `Valor incorreto: ${headerValue}`
            );
            allHeadersPresent = false;
          }
        } else {
          logResult(`Header ${header}`, true, headerValue);
        }
      } else if (hasHeader) {
        logResult(`Header ${header}`, true, headerValue);
      }
    }

    return allHeadersPresent;
  } catch (error) {
    log(`Erro ao verificar headers: ${error.message}`, colors.red);
    return false;
  }
}

// Função para testar rate limiting
async function testRateLimiting(url) {
  log('\n=== Testando Rate Limiting ===', colors.cyan);

  try {
    const endpoint = new URL('/api/v1/news', url).toString();
    log(
      `Enviando ${RATE_LIMIT_REQUESTS} requisições para ${endpoint}...`,
      colors.yellow
    );

    const responses = [];

    for (let i = 0; i < RATE_LIMIT_REQUESTS; i++) {
      const response = await fetch(endpoint);
      responses.push({
        status: response.status,
        rateLimit: {
          limit: response.headers.get('X-RateLimit-Limit'),
          remaining: response.headers.get('X-RateLimit-Remaining'),
          reset: response.headers.get('X-RateLimit-Reset'),
        },
      });

      // Pequeno delay para não sobrecarregar
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Verificar se alguma resposta teve código 429 (Too Many Requests)
    const hasRateLimit = responses.some((r) => r.status === 429);
    const hasRateLimitHeaders = responses.some(
      (r) =>
        r.rateLimit.limit !== null &&
        r.rateLimit.remaining !== null &&
        r.rateLimit.reset !== null
    );

    if (hasRateLimit) {
      logResult('Rate limiting implementado', true, 'Recebeu código 429');
    } else if (hasRateLimitHeaders) {
      logResult('Headers de rate limiting presentes', true);
      logResult(
        'Rate limiting implementado',
        false,
        'Não recebeu código 429, mas tem headers'
      );
    } else {
      logResult('Rate limiting implementado', false, 'Sem headers ou bloqueio');
    }

    return hasRateLimit || hasRateLimitHeaders;
  } catch (error) {
    log(`Erro ao testar rate limiting: ${error.message}`, colors.red);
    return false;
  }
}

// Função para testar vulnerabilidades XSS
async function testXSSVulnerabilities(url) {
  log('\n=== Testando Vulnerabilidades XSS ===', colors.cyan);

  try {
    const results = [];

    for (const endpoint of ENDPOINTS_TO_TEST) {
      const fullUrl = new URL(endpoint, url).toString();
      log(`Testando ${fullUrl}...`, colors.yellow);

      for (const payload of XSS_PAYLOADS) {
        // Testar via parâmetros de URL
        const testUrl = `${fullUrl}?q=${encodeURIComponent(payload)}`;
        const response = await fetch(testUrl);
        const body = await response.text();

        // Verificar se o payload foi refletido sem escape
        const isVulnerable = body.includes(
          payload.replace(/"/g, '\\"').replace(/'/g, "\\'")
        );

        if (isVulnerable) {
          results.push({
            endpoint,
            payload,
            vulnerable: true,
          });
          log(
            `  - Possível vulnerabilidade encontrada com payload: ${payload}`,
            colors.red
          );
        }
      }
    }

    const isSecure = results.length === 0;
    logResult(
      'Proteção contra XSS',
      isSecure,
      isSecure ? '' : `${results.length} possíveis vulnerabilidades encontradas`
    );

    return isSecure;
  } catch (error) {
    log(`Erro ao testar vulnerabilidades XSS: ${error.message}`, colors.red);
    return false;
  }
}

// Função para verificar configurações de CORS
async function checkCORSConfiguration(url) {
  log('\n=== Verificando Configurações de CORS ===', colors.cyan);

  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://malicious-site.com',
        'Access-Control-Request-Method': 'GET',
      },
    });

    const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
    const allowMethods = response.headers.get('Access-Control-Allow-Methods');
    const allowHeaders = response.headers.get('Access-Control-Allow-Headers');

    const isSecure =
      !allowOrigin ||
      allowOrigin === '*' ||
      allowOrigin.includes('malicious-site.com');

    if (isSecure) {
      logResult('Configuração de CORS', false, 'Permite origens não seguras');
    } else {
      logResult('Configuração de CORS', true);
    }

    log(
      `  - Access-Control-Allow-Origin: ${allowOrigin || 'não definido'}`,
      colors.yellow
    );
    log(
      `  - Access-Control-Allow-Methods: ${allowMethods || 'não definido'}`,
      colors.yellow
    );
    log(
      `  - Access-Control-Allow-Headers: ${allowHeaders || 'não definido'}`,
      colors.yellow
    );

    return !isSecure;
  } catch (error) {
    log(`Erro ao verificar CORS: ${error.message}`, colors.red);
    return false;
  }
}

// Função para verificar se o site está usando HTTPS
async function checkHTTPS(url) {
  log('\n=== Verificando HTTPS ===', colors.cyan);

  const isHttps = url.startsWith('https://');
  logResult('Uso de HTTPS', isHttps);

  return isHttps;
}

// Função para verificar redirecionamentos HTTP para HTTPS
async function checkHTTPRedirect(url) {
  if (url.startsWith('https://')) {
    const httpUrl = url.replace('https://', 'http://');

    try {
      log(
        `Verificando redirecionamento de ${httpUrl} para HTTPS...`,
        colors.yellow
      );

      const response = await fetch(httpUrl, { redirect: 'manual' });
      const redirectUrl = response.headers.get('location');

      const redirectsToHttps =
        redirectUrl && redirectUrl.startsWith('https://');
      logResult(
        'Redirecionamento HTTP para HTTPS',
        redirectsToHttps,
        redirectsToHttps ? redirectUrl : 'Sem redirecionamento'
      );

      return redirectsToHttps;
    } catch (error) {
      log(`Erro ao verificar redirecionamento: ${error.message}`, colors.red);
      return false;
    }
  }

  return false;
}

// Função para verificar cookies seguros
async function checkSecureCookies(url) {
  log('\n=== Verificando Cookies Seguros ===', colors.cyan);

  try {
    const response = await fetch(url);
    const cookies = response.headers.get('set-cookie');

    if (!cookies) {
      log('Nenhum cookie definido', colors.yellow);
      return true;
    }

    const cookieList = cookies.split(',').map((cookie) => cookie.trim());
    let allCookiesSecure = true;

    for (const cookie of cookieList) {
      const hasSecure = cookie.toLowerCase().includes('secure');
      const hasHttpOnly = cookie.toLowerCase().includes('httponly');
      const hasSameSite = cookie.toLowerCase().includes('samesite');

      const cookieName = cookie.split('=')[0];

      if (!hasSecure || !hasHttpOnly) {
        allCookiesSecure = false;
        logResult(
          `Cookie ${cookieName}`,
          false,
          `Secure: ${hasSecure}, HttpOnly: ${hasHttpOnly}, SameSite: ${hasSameSite}`
        );
      } else {
        logResult(
          `Cookie ${cookieName}`,
          true,
          `Secure: ${hasSecure}, HttpOnly: ${hasHttpOnly}, SameSite: ${hasSameSite}`
        );
      }
    }

    return allCookiesSecure;
  } catch (error) {
    log(`Erro ao verificar cookies: ${error.message}`, colors.red);
    return false;
  }
}

// Função para executar o nmap (se disponível)
async function runNmap(url) {
  log('\n=== Executando Nmap (Portas Abertas) ===', colors.cyan);

  try {
    const { hostname } = new URL(url);

    const { stdout, stderr } = await execPromise(`nmap -F ${hostname}`);

    if (stderr) {
      log(`Erro ao executar nmap: ${stderr}`, colors.red);
      return false;
    }

    log(stdout, colors.white);
    return true;
  } catch (error) {
    log(
      `Nmap não disponível ou erro ao executar: ${error.message}`,
      colors.yellow
    );
    log('Instale o nmap para verificar portas abertas', colors.yellow);
    return false;
  }
}

// Função principal
async function main() {
  // Obter URL do argumento de linha de comando ou usar padrão
  const url = process.argv[2] || DEFAULT_URL;

  log(`\n🔒 Iniciando verificação de segurança para: ${url}`, colors.magenta);
  log('='.repeat(50), colors.magenta);

  // Executar testes
  const results = {
    headers: await checkSecurityHeaders(url),
    rateLimit: await testRateLimiting(url),
    xss: await testXSSVulnerabilities(url),
    cors: await checkCORSConfiguration(url),
    https: await checkHTTPS(url),
    httpRedirect: url.startsWith('https://')
      ? await checkHTTPRedirect(url)
      : false,
    cookies: await checkSecureCookies(url),
  };

  // Tentar executar nmap se disponível
  await runNmap(url);

  // Resumo
  log('\n=== Resumo da Verificação de Segurança ===', colors.magenta);

  let passedTests = 0;
  let totalTests = Object.keys(results).length;

  for (const [test, result] of Object.entries(results)) {
    if (result) passedTests++;

    const testNames = {
      headers: 'Headers de Segurança',
      rateLimit: 'Rate Limiting',
      xss: 'Proteção contra XSS',
      cors: 'Configuração de CORS',
      https: 'Uso de HTTPS',
      httpRedirect: 'Redirecionamento HTTP para HTTPS',
      cookies: 'Cookies Seguros',
    };

    logResult(testNames[test], result);
  }

  const score = Math.round((passedTests / totalTests) * 100);
  const scoreColor =
    score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;

  log(
    `\nPontuação de Segurança: ${scoreColor}${score}%${colors.reset} (${passedTests}/${totalTests})`,
    colors.white
  );

  if (score < 70) {
    log(
      '\n⚠️ Recomendação: Corrija os problemas de segurança antes de lançar o site.',
      colors.red
    );
  } else if (score < 90) {
    log(
      '\n⚠️ Recomendação: Considere melhorar os aspectos de segurança marcados como falha.',
      colors.yellow
    );
  } else {
    log(
      '\n✅ Recomendação: O site parece ter boa segurança básica.',
      colors.green
    );
  }
}

// Executar o script
main().catch((error) => {
  log(
    `\nErro ao executar verificação de segurança: ${error.message}`,
    colors.red
  );
  process.exit(1);
});
