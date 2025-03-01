#!/usr/bin/env node
"use strict";
/**
 * Script para limpar imagens órfãs da Cloudinary que não estão mais associadas a notícias
 *
 * Este script:
 * 1. Busca todas as notícias no Firestore
 * 2. Coleta todas as URLs de imagens em uso
 * 3. Busca todas as imagens na Cloudinary
 * 4. Identifica imagens que não estão sendo usadas por nenhuma notícia
 * 5. Exclui as imagens órfãs da Cloudinary
 *
 * Uso: node src/scripts/cleanupOrphanedImages.js
 *
 * Nota: Este script deve ser executado apenas no servidor, não no navegador.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Configuração do Cloudinary
var cloudinary_1 = require("cloudinary");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuração do Firebase
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
// Configuração do Firebase
var firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
// Inicializa o Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_1.getFirestore)(app);
// Configuração do Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Log das configurações (sem mostrar a chave secreta)
console.log('Configurações do Cloudinary:');
console.log('- Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Configurada' : '✗ Não configurada');
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Configurada' : '✗ Não configurada');
/**
 * Extrai o public_id de uma URL da Cloudinary
 * @param url URL da imagem da Cloudinary
 * @returns O public_id da imagem ou null se não for possível extrair
 */
var extractPublicIdFromUrl = function (url) {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }
    // Formato típico: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/abcdef123456.jpg
    // ou https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/abcdef123456.jpg
    // Primeiro, tenta extrair com o formato que inclui pasta
    var regex = /\/v\d+\/([^/]+\/[^.]+)/;
    var match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    // Se não encontrou com o formato que inclui pasta, tenta sem pasta
    regex = /\/v\d+\/([^.]+)/;
    match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    return null;
};
/**
 * Exclui uma imagem da Cloudinary pelo seu public_id
 * @param publicId O public_id da imagem
 * @returns O resultado da operação de exclusão
 */
var deleteImage = function (publicId) {
    return new Promise(function (resolve, reject) {
        cloudinary_1.v2.uploader.destroy(publicId, function (error, result) {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
};
function cleanupOrphanedImages() {
    return __awaiter(this, void 0, void 0, function () {
        var newsSnapshot, usedImageUrls_1, usedPublicIds_1, allResources, usedPublicIdsArray_1, orphanedImages, shouldForce, _i, orphanedImages_1, image, result, error_1, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Iniciando limpeza de imagens órfãs...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 15, , 16]);
                    // 1. Busca todas as notícias no Firestore
                    console.log('Buscando todas as notícias...');
                    return [4 /*yield*/, (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'news'))];
                case 2:
                    newsSnapshot = _a.sent();
                    usedImageUrls_1 = new Set();
                    usedPublicIds_1 = new Set();
                    newsSnapshot.forEach(function (doc) {
                        var newsData = doc.data();
                        if (newsData.imageUrl) {
                            usedImageUrls_1.add(newsData.imageUrl);
                            var publicId = extractPublicIdFromUrl(newsData.imageUrl);
                            if (publicId) {
                                usedPublicIds_1.add(publicId);
                            }
                        }
                    });
                    console.log("Encontradas ".concat(usedImageUrls_1.size, " imagens em uso."));
                    // Mostra alguns exemplos de public_ids em uso para depuração
                    if (usedPublicIds_1.size > 0) {
                        console.log('Exemplos de public_ids em uso:');
                        Array.from(usedPublicIds_1)
                            .slice(0, 5)
                            .forEach(function (id) {
                            console.log("- ".concat(id));
                        });
                    }
                    // 3. Busca todas as imagens no Cloudinary
                    console.log('Buscando todas as imagens no Cloudinary...');
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 13, , 14]);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            cloudinary_1.v2.api.resources({
                                type: 'upload',
                                max_results: 500,
                            }, function (error, result) {
                                if (error) {
                                    console.error('Erro ao buscar recursos na Cloudinary:', error);
                                    reject(error);
                                }
                                resolve(result || { resources: [] });
                            });
                        })];
                case 4:
                    allResources = _a.sent();
                    console.log("Encontradas ".concat(allResources.resources.length, " imagens no total na Cloudinary."));
                    // Mostrar algumas imagens para entender a estrutura
                    console.log('Exemplos de public_ids de todas as imagens:');
                    allResources.resources.slice(0, 5).forEach(function (resource) {
                        console.log("- ".concat(resource.public_id));
                    });
                    usedPublicIdsArray_1 = Array.from(usedPublicIds_1);
                    orphanedImages = allResources.resources.filter(function (resource) {
                        // Verifica se o public_id está na lista de public_ids em uso
                        var isUsed = usedPublicIdsArray_1.some(function (usedId) {
                            return (resource.public_id === usedId ||
                                resource.public_id.endsWith(usedId) ||
                                usedId.endsWith(resource.public_id));
                        });
                        return !isUsed;
                    });
                    console.log("Encontradas ".concat(orphanedImages.length, " imagens \u00F3rf\u00E3s."));
                    // Listar imagens órfãs para depuração
                    if (orphanedImages.length > 0) {
                        console.log('Primeiras 10 imagens órfãs encontradas:');
                        orphanedImages.slice(0, 10).forEach(function (resource) {
                            console.log("- ".concat(resource.public_id, " (").concat(resource.url, ")"));
                        });
                        if (orphanedImages.length > 10) {
                            console.log("... e mais ".concat(orphanedImages.length - 10, " imagens"));
                        }
                    }
                    // Confirmação antes de excluir muitas imagens
                    if (orphanedImages.length > 50) {
                        console.log("ATEN\u00C7\u00C3O: Foram encontradas ".concat(orphanedImages.length, " imagens \u00F3rf\u00E3s."));
                        console.log('Para excluir automaticamente, execute o script com o parâmetro --force');
                        console.log('Exemplo: node src/scripts/cleanupOrphanedImages.js --force');
                        shouldForce = process.argv.includes('--force');
                        if (!shouldForce) {
                            console.log('Script encerrado sem excluir imagens. Use --force para excluir.');
                            return [2 /*return*/];
                        }
                    }
                    if (!(orphanedImages.length > 0)) return [3 /*break*/, 11];
                    console.log('Excluindo imagens órfãs...');
                    _i = 0, orphanedImages_1 = orphanedImages;
                    _a.label = 5;
                case 5:
                    if (!(_i < orphanedImages_1.length)) return [3 /*break*/, 10];
                    image = orphanedImages_1[_i];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    console.log("Excluindo imagem: ".concat(image.public_id));
                    return [4 /*yield*/, deleteImage(image.public_id)];
                case 7:
                    result = _a.sent();
                    console.log("Resultado: ".concat(JSON.stringify(result)));
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error("Erro ao excluir imagem ".concat(image.public_id, ":"), error_1);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10:
                    console.log("".concat(orphanedImages.length, " imagens \u00F3rf\u00E3s exclu\u00EDdas com sucesso."));
                    return [3 /*break*/, 12];
                case 11:
                    console.log('Nenhuma imagem órfã encontrada.');
                    _a.label = 12;
                case 12:
                    console.log('Limpeza de imagens órfãs concluída com sucesso!');
                    return [3 /*break*/, 14];
                case 13:
                    error_2 = _a.sent();
                    console.error('Erro ao buscar imagens na Cloudinary:', error_2);
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_3 = _a.sent();
                    console.error('Erro ao executar limpeza de imagens órfãs:', error_3);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Executa a limpeza
cleanupOrphanedImages();
//# sourceMappingURL=cleanupOrphanedImages.js.map