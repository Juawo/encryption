const http = require('http');
const { cifrar } = require('./cipher');

const mensagemOriginal = "maria da inglaterra show";
const mensagemCifrada = cifrar(mensagemOriginal);

console.log(`[A] Mensagem original: ${mensagemOriginal}`);
console.log(`[A] Enviando cifrado diretamente para B...`);

const options = {
    hostname: 'container_b', // Apontando direto para o destino correto
    port: 3000,
    method: 'POST',
    headers: { 
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(mensagemCifrada)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`[A] Resposta final recebida de B: "${data}"`);
    });
});

req.write(mensagemCifrada);
req.end();