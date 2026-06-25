// const { spawn } = require('child_process'); // Modulo para executar comandos do sistema operacional
// const net = require('net'); // Modulo para comunicacao TCP
// const { ALPHABET, REAL_KEY, decrypt } = require('./cipher'); // Importa dados base e funcao de descriptografia

// console.log('[C] Iniciando interceptacao via tcpdump na porta 3000...');

// // Executa tcpdump nativo do Linux escutando em todas as interfaces, na porta 3000, e extraindo o texto em tempo real
// const tcpdump = spawn('tcpdump', ['-i', 'any', '-A', '-l', 'tcp', 'port', '3000']);

// let interceptedCipher = null; // Variavel para armazenar a cifra quando for capturada

// // Le a saida do comando tcpdump conforme ela vai sendo gerada
// tcpdump.stdout.on('data', (data) => {
//     const output = data.toString();
//     const match = output.match(/ENCRYPTED:([A-Z\s]+)/); // Busca pelo padrao do envio feito pelo Container A
    
//     if (match && !interceptedCipher) { // Se encontrou e ainda nao tinha capturado
//         interceptedCipher = match[1].trim(); // Extrai apenas o trecho da mensagem
//         console.log(`\n----------------------------------------`);
//         console.log(`[C] PACOTE TCP INTERCEPTADO!`);
//         console.log(`[C] Conteudo bruto extraido: "${interceptedCipher}"`);
//         console.log(`----------------------------------------\n`);
        
//         tcpdump.kill(); // Encerra a escuta da rede para poupar recursos
//         startBruteForce(interceptedCipher); // Inicia os ataques com a mensagem capturada
//     }
// });

// // Funcao para criar uma chave monoalfabetica aleatoria
// function shuffleAlphabet() {
//     const arr = ALPHABET.split('');
//     for (let i = arr.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [arr[i], arr[j]] = [arr[j], arr[i]];
//     }
//     return arr.join('');
// }

// // Funcao que se conecta ao Container B e envia o chute, retornando true ou false
// async function testGuess(guess) {
//     return new Promise((resolve) => {
//         const client = new net.Socket();
//         // Conecta no proprio localhost, pois compartilha a rede do Container B via docker-compose
//         client.connect(3000, '127.0.0.1', () => {
//             client.write(`GUESS:${guess}`); // Envia a tentativa com prefixo
//         });

//         // Avalia se o Container B respondeu com validacao de sucesso
//         client.on('data', (data) => {
//             const response = data.toString().trim();
//             client.destroy();
//             resolve(response === 'VALID');
//         });

//         client.on('error', () => resolve(false));
//     });
// }

// // Laco principal do ataque configurado para demonstracao com limite
// async function startBruteForce(cipherText) {
//     console.log(`[C] Iniciando ataque de quebra de cifra. Limite configurado: 10 tentativas.\n`);
//     const maxAttempts = 10;
    
//     // Gera as 10 chaves falsas
//     const attemptsKeys = Array.from({ length: maxAttempts }, () => shuffleAlphabet());
//     const luckyIndex = Math.floor(Math.random() * maxAttempts); // Escolhe uma posicao aleatoria no array
//     attemptsKeys[luckyIndex] = REAL_KEY; // Injeta a chave real escondida no array para garantir o sucesso no teste

//     for (let i = 0; i < maxAttempts; i++) { // Roda o laco pelas 10 tentativas
//         const keyAttempt = attemptsKeys[i];
//         const decryptedGuess = decrypt(cipherText, keyAttempt); // Tenta quebrar usando a chave atual
        
//         console.log(`[C] Tentativa ${i + 1}/10`);
//         console.log(`    > Testando Chave: ${keyAttempt}`);
//         console.log(`    > Resultado Descriptografado: "${decryptedGuess}"`);
        
//         const isValid = await testGuess(decryptedGuess); // Valida la no Container B

//         if (isValid) { // Se bateu, exibe o sucesso e para a execucao
//             console.log(`\n[C] SUCESSO CRITICO! A validacao no Container B retornou positivo.`);
//             console.log(`[C] MENSAGEM ORIGINAL DESCOBERTA: "${decryptedGuess}"\n`);
//             return;
//         } else {
//             console.log(`[C] Falha. Container B invalidou a tentativa.\n`);
//         }
//     }
// }
// versão sem limitação 
const { spawn } = require('child_process'); // Usado para executar comandos no shell
const net = require('net'); // Biblioteca TCP padrao
const { ALPHABET, decrypt } = require('./cipher'); // Lida com o alfabeto padrao e descriptografia

console.log('[C] Iniciando interceptacao via tcpdump na porta 3000...');

// Dispara o tcpdump para capturar pacotes de texto plano
const tcpdump = spawn('tcpdump', ['-i', 'any', '-A', '-l', 'tcp', 'port', '3000']);

let interceptedCipher = null; // Guarda o estado da interceptacao

// Evento disparado quando o tcpdump gera nova leitura
tcpdump.stdout.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/ENCRYPTED:([A-Z\s]+)/); // Filtra o texto especifico usando expressao regular
    
    if (match && !interceptedCipher) {
        interceptedCipher = match[1].trim(); // Pega apenas a substring capturada
        console.log(`\n----------------------------------------`);
        console.log(`[C] PACOTE TCP INTERCEPTADO!`);
        console.log(`[C] Conteudo bruto extraido: "${interceptedCipher}"`);
        console.log(`----------------------------------------\n`);
        
        tcpdump.kill(); // Encerra o processo rastreador
        startBruteForce(interceptedCipher); // Comeca a processar o texto obtido
    }
});

// Gera um novo embaralhamento total do alfabeto
function shuffleAlphabet() {
    const arr = ALPHABET.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

// Funcao assincrona que cria e gerencia o contato com B para cada tentativa
async function testGuess(guess) {
    return new Promise((resolve) => {
        const client = new net.Socket();
        client.connect(3000, '127.0.0.1', () => { // B está em localhost porque compartilham rede no Compose
            client.write(`GUESS:${guess}`);
        });

        client.on('data', (data) => {
            const response = data.toString().trim();
            client.destroy(); // Libera o socket imediatamente apos a resposta
            resolve(response === 'VALID'); // Retorna boolean checando a resposta
        });

        client.on('error', () => resolve(false));
    });
}

// Laco infinito de forca bruta
async function startBruteForce(cipherText) {
    console.log(`[C] Iniciando ataque de forca bruta continuo (Ctrl+C para parar)...\n`);
    let attemptCount = 1; // Contador de tentativas feitas
    
    while (true) { // Roda ate ser encerrado manualmente ou achar a resposta
        const keyAttempt = shuffleAlphabet(); // Cria chave aleatoria
        const decryptedGuess = decrypt(cipherText, keyAttempt); // Tenta descriptografar
        
        console.log(`[C] Tentativa ${attemptCount}`);
        console.log(`    > Testando Chave: ${keyAttempt}`);
        console.log(`    > Resultado Descriptografado: "${decryptedGuess}"`);
        
        const isValid = await testGuess(decryptedGuess); // Testa via rede com B

        if (isValid) { // Quebra o laco while em caso de acerto
            console.log(`\n[C] SUCESSO CRITICO! A validacao no Container B retornou positivo.`);
            console.log(`[C] MENSAGEM ORIGINAL DESCOBERTA: "${decryptedGuess}"\n`);
            break; 
        }

        attemptCount++;

        // Aguarda 10 milissegundos antes da proxima tentativa para nao travar o SO ou exceder limite de portas
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}