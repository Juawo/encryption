const http = require('http');
const { descriptografar } = require('./cipher');

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            console.log(`[B] Recebido (Cifrado): ${body}`);
            const textoClaro = descriptografar(body);
            console.log(`[B] Mensagem Descriptografada com sucesso: "${textoClaro}"`);
            
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Sucesso! B recebeu e leu: ${textoClaro}`);
        });
    }
});

server.listen(3000, () => console.log('Container B rodando na porta 3000...'));