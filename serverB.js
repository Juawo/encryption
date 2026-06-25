const net = require('net'); // Requisita o modulo de rede nativo TCP
const { decrypt } = require('./cipher'); // Requisita as operacoes de cifra

let lastPlaintext = null; // Armazena temporariamente a ultima mensagem valida e traduzida

// Levanta o servidor que tratara as entradas de rede
const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const message = data.toString().trim(); // Padroniza a string recebida
        
        if (message.startsWith('ENCRYPTED:')) { // Se for o Container A (Origem)
            const cipherText = message.replace('ENCRYPTED:', '').trim(); // Remove a tag identificadora
            lastPlaintext = decrypt(cipherText); // Descriptografa com a chave real que ele possui e guarda na memoria
            console.log(`[B] Mensagem criptografada recebida.`);
            console.log(`[B] Descriptografado internamente: "${lastPlaintext}"`);
            socket.write('ACK\n'); // Manda o OK para quem enviou
        } 
        else if (message.startsWith('GUESS:')) { // Se for o Container C (Invasor/Testador)
            const guess = message.replace('GUESS:', '').trim(); // Remove a tag do invasor
            console.log(`[B] O Container C pediu validacao da tentativa: "${guess}"`);
            
            if (guess === lastPlaintext) { // Compara a tentativa invasora com o texto interno real salvo
                console.log(`[B] Retornando: VALIDACAO CORRETA.`);
                socket.write('VALID\n'); // Responde informando acerto
            } else {
                console.log(`[B] Retornando: VALIDACAO INCORRETA.`);
                socket.write('INVALID\n'); // Responde informando erro
            }
        }
    });
});

// Comeca a ouvir na porta 3000 aberta para todas as interfaces de rede no container
server.listen(3000, '0.0.0.0', () => {
    console.log('[B] Servidor rodando na porta 3000 aguardando conexoes...');
});