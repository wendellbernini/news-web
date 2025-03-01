#!/usr/bin/env node

/**
 * Script para configurar um agendamento de limpeza de imagens órfãs
 *
 * Este script configura um job cron para executar o script de limpeza de imagens órfãs
 * periodicamente (por padrão, uma vez por mês).
 *
 * Uso: node src/scripts/scheduleCleanup.js
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Caminho para o script de limpeza
const projectRoot = path.resolve(__dirname, '..', '..');
const cleanupScript = path.join(
  projectRoot,
  'src',
  'scripts',
  'cleanupOrphanedImages.ts'
);

// Comando para executar o script
const command = `cd ${projectRoot} && ts-node ${cleanupScript} --force`;

// Configuração do cron (por padrão, executa às 3h da manhã no primeiro dia de cada mês)
const cronSchedule = '0 3 1 * *';

// Função para adicionar o job ao crontab
function setupCronJob() {
  // Verifica se estamos em um sistema Unix-like
  if (os.platform() === 'win32') {
    console.error(
      'Este script só funciona em sistemas Unix-like (Linux, macOS).'
    );
    console.error('Para Windows, configure uma Tarefa Agendada manualmente.');
    process.exit(1);
  }

  // Obtém o crontab atual
  exec('crontab -l', (error, stdout, stderr) => {
    let crontab = '';

    // Se houver um erro e não for porque o crontab está vazio
    if (error && error.code !== 1) {
      console.error('Erro ao ler o crontab:', stderr);
      process.exit(1);
    } else {
      crontab = stdout;
    }

    // Verifica se o job já existe
    if (crontab.includes(cleanupScript)) {
      console.log('O job de limpeza já está configurado no crontab.');
      return;
    }

    // Adiciona o novo job
    const newJob = `${cronSchedule} ${command} >> ${projectRoot}/logs/cleanup.log 2>&1\n`;
    const newCrontab = crontab + newJob;

    // Cria o diretório de logs se não existir
    const logsDir = path.join(projectRoot, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Escreve o novo crontab
    const tempFile = path.join(os.tmpdir(), 'crontab.tmp');
    fs.writeFileSync(tempFile, newCrontab);

    exec(`crontab ${tempFile}`, (error, _stdout, stderr) => {
      if (error) {
        console.error('Erro ao configurar o crontab:', stderr);
        process.exit(1);
      }

      console.log('Job de limpeza configurado com sucesso!');
      console.log(
        `Agendamento: ${cronSchedule} (às 3h da manhã no primeiro dia de cada mês)`
      );
      console.log(`Comando: ${command}`);
      console.log(`Logs: ${path.join(projectRoot, 'logs', 'cleanup.log')}`);

      // Remove o arquivo temporário
      fs.unlinkSync(tempFile);
    });
  });
}

// Executa a configuração
setupCronJob();
