const net = require('net'); // Modulo nativo do Node.js para comunicacao via sockets TCP
const { encrypt } = require('./cipher'); // Importa a logica de criptografia compartilhada

const mensagemOriginal = "OI"; // Define o conteudo da mensagem a ser enviada
const mensagemCriptografada = encrypt(mensagemOriginal); // Aplica a cifra monoalfabetica na mensagem

console.log(`[A] Mensagem original definida: "${mensagemOriginal}"`);
console.log(`[A] Mensagem criptografada gerada: "${mensagemCriptografada}"`);
console.log(`[A] Iniciando transmissao para o Container B...`);

const client = new net.Socket(); // Instancia um novo cliente TCP

// Conecta ao container_b usando o hostname da rede Docker na porta 3000
client.connect(3000, 'container_b', () => {
    // Envia a mensagem com um prefixo identificador
    client.write(`ENCRYPTED:${mensagemCriptografada}`);
});

// Fica escutando os dados retornados pelo servidor
client.on('data', (data) => {
    if (data.toString().trim() === 'ACK') { // Verifica se B confirmou o recebimento
        console.log('[A] Container B confirmou o recebimento. Encerrando A.');
        client.destroy(); // Fecha a conexao de rede apos enviar e receber confirmacao
    }
});

// Captura e exibe eventuais erros de rede
client.on('error', (err) => {
    console.error('[A] Erro de conexao:', err.message);
});