const http = require('http');
const { cifrar } = require('./cipher');

const mensagemOriginal = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.";

const mensagemCifrada = cifrar(mensagemOriginal);
console.log("MENSAGEM CIFRADA : ", mensagemCifrada)
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