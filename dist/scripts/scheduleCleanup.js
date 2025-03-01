#!/usr/bin/env node
"use strict";
/**
 * Script para configurar um agendamento de limpeza de imagens órfãs
 *
 * Este script configura um job cron para executar o script de limpeza de imagens órfãs
 * periodicamente (por padrão, uma vez por mês).
 *
 * Uso: node src/scripts/scheduleCleanup.js
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
// Caminho para o script de limpeza
var projectRoot = path_1.default.resolve(__dirname, '..', '..');
var cleanupScript = path_1.default.join(projectRoot, 'src', 'scripts', 'cleanupOrphanedImages.ts');
// Comando para executar o script
var command = "cd ".concat(projectRoot, " && ts-node ").concat(cleanupScript, " --force");
// Configuração do cron (por padrão, executa às 3h da manhã no primeiro dia de cada mês)
var cronSchedule = '0 3 1 * *';
// Função para adicionar o job ao crontab
function setupCronJob() {
    // Verifica se estamos em um sistema Unix-like
    if (os_1.default.platform() === 'win32') {
        console.error('Este script só funciona em sistemas Unix-like (Linux, macOS).');
        console.error('Para Windows, configure uma Tarefa Agendada manualmente.');
        process.exit(1);
    }
    // Obtém o crontab atual
    (0, child_process_1.exec)('crontab -l', function (error, stdout, stderr) {
        var crontab = '';
        // Se houver um erro e não for porque o crontab está vazio
        if (error && error.code !== 1) {
            console.error('Erro ao ler o crontab:', stderr);
            process.exit(1);
        }
        else {
            crontab = stdout;
        }
        // Verifica se o job já existe
        if (crontab.includes(cleanupScript)) {
            console.log('O job de limpeza já está configurado no crontab.');
            return;
        }
        // Adiciona o novo job
        var newJob = "".concat(cronSchedule, " ").concat(command, " >> ").concat(projectRoot, "/logs/cleanup.log 2>&1\n");
        var newCrontab = crontab + newJob;
        // Cria o diretório de logs se não existir
        var logsDir = path_1.default.join(projectRoot, 'logs');
        if (!fs_1.default.existsSync(logsDir)) {
            fs_1.default.mkdirSync(logsDir, { recursive: true });
        }
        // Escreve o novo crontab
        var tempFile = path_1.default.join(os_1.default.tmpdir(), 'crontab.tmp');
        fs_1.default.writeFileSync(tempFile, newCrontab);
        (0, child_process_1.exec)("crontab ".concat(tempFile), function (error, _stdout, stderr) {
            if (error) {
                console.error('Erro ao configurar o crontab:', stderr);
                process.exit(1);
            }
            console.log('Job de limpeza configurado com sucesso!');
            console.log("Agendamento: ".concat(cronSchedule, " (\u00E0s 3h da manh\u00E3 no primeiro dia de cada m\u00EAs)"));
            console.log("Comando: ".concat(command));
            console.log("Logs: ".concat(path_1.default.join(projectRoot, 'logs', 'cleanup.log')));
            // Remove o arquivo temporário
            fs_1.default.unlinkSync(tempFile);
        });
    });
}
// Executa a configuração
setupCronJob();
//# sourceMappingURL=scheduleCleanup.js.map