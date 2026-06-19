const { spawn } = require('child_process');

console.log('[C] Iniciando ataque de força bruta via escuta de rede...');

const ALFABETO_REAL = 'abcdefghijklmnopqrstuvwxyz';

// Ajustado: Se a mensagem tiver apenas as palavras "amanhecer base", precisamos checar se encontra 1 ou mais delas
const DICIONARIO = ["Lorem", "Ipsum", "is", "simply", "dummy", "text", "of", "the", "printing", "and", "typesetting", "industry", "Lorem", "Ipsum", "has", "been", "the", "industry's", "standard", "dummy", "text", "ever", "since", "1966", "when", "designers", "at", "Letraset", "and", "James", "Mosley", "the", "librarian", "at", "St", "Bride", "Printing", "Library", "in", "London", "took", "a", "1914", "Cicero", "translation", "and", "scrambled", "it", "to", "make", "dummy", "text", "for", "Letraset's", "Body", "Type", "sheets", "It", "has", "survived", "not", "only", "many", "decades", "but", "also", "the", "leap", "into", "electronic", "typesetting", "remaining", "essentially", "unchanged", "It", "was", "popularised", "thanks", "to", "these", "sheets", "and", "more", "recently", "with", "desktop", "publishing", "software", "including", "versions", "of", "Lorem", "Ipsum"];

function tentarDescriptografar(textoCifrado, chavePalpite) {
    return textoCifrado.toLowerCase().split('').map(char => {
        const idx = chavePalpite.indexOf(char);
        return idx !== -1 ? ALFABETO_REAL[idx] : char;
    }).join('');
}

function executarForcaBruta(textoCifrado) {
    const wordlistDeChaves = [
        'abcdefghijklmnopqrstuvwxyz', 
        'zyxwvutsrqponmlkjihgfedcba', 
        'qwertyuiopasdfghjklzxcvbnm', 
        'zebrasdfghijklmnopqtuvwxyz', // A chave real usada por A e B
        'mnbvcxzlkjhgfdsaqwertyuiop'  
    ];

    console.log(`\n[C] Iniciando varredura de Wordlist com ${wordlistDeChaves.length} chaves candidatas...`);
    let sucesso = false;

    for (let i = 0; i < wordlistDeChaves.length; i++) {
        const chaveCandidata = wordlistDeChaves[i];
        const textoTentativa = tentarDescriptografar(textoCifrado, chaveCandidata);
        
        console.log(`[C] Testando Chave #${i+1} [${chaveCandidata.substring(0,6)}...]: Tentativa -> "${textoTentativa}"`);

        // Verifica se o resultado possui palavras conhecidas em português
        const palavrasEncontradas = DICIONARIO.filter(palavra => textoTentativa.includes(palavra));
        
        // Mudança aqui: Se encontrar pelo menos 1 palavra longa do dicionário, já consideramos sucesso
        if (palavrasEncontradas.length >= 1 && palavrasEncontradas.some(p => p.length > 3)) { 
            console.log(`\n🏆 [C] SUCESSO COMPLETO NA QUEBRA!`);
            console.log(`Chave descoberta: "${chaveCandidata}"`);
            console.log(`Mensagem original roubada: "${textoTentativa}"`);
            sucesso = true;
            break;
        }
    }

    if (!sucesso) {
        console.log(`[C] Força bruta encerrada. Nenhuma chave quebrou o texto.`);
    }
}

// Inicializa o tcpdump capturando pacotes na porta 3000
const tcpdump = spawn('tcpdump', ['-l', '-A', 'port', '3000']);
let bufferDeRede = '';

tcpdump.stdout.on('data', (data) => {
    bufferDeRede += data.toString();

    // Quando detectamos o início de uma requisição POST válida
    if (bufferDeRede.includes('POST / HTTP')) {
        
        // Aguarda um curto período para garantir que todo o pacote HTTP chegou ao buffer
        setTimeout(() => {
            // No protocolo HTTP, os cabeçalhos terminam e o corpo começa APÓS uma linha em branco dupla (\r\n\r\n)
            // Vamos quebrar o bloco onde o HTTP começa para isolar o corpo
            const partesHttp = bufferDeRede.split('POST / HTTP');
            
            if (partesHttp.length > 1) {
                const blocoRequisicao = partesHttp[1];
                
                // Divide os cabeçalhos do corpo da mensagem usando a quebra dupla padrão do HTTP
                const divisaoCorpo = blocoRequisicao.split(/\r?\n\r?\n/);
                
                if (divisaoCorpo.length > 1) {
                    // O corpo do POST (nosso texto cifrado) estará na parte seguinte aos cabeçalhos
                    let corpoBruto = divisaoCorpo[1].split('HTTP/1.1 200 OK')[0]; // Garante que não pega a resposta de B se vier colada
                    
                    // Remove caracteres de controle estranhos, pontos residuais de rede e quebras de linha
                    // Mantém apenas letras minúsculas e espaços (que é o padrão da cifra gerada)
                    let textoCifradoLimpo = corpoBruto
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, '') // Remove tudo que não for letra ou espaço
                        .replace(/\s+/g, ' ')     // Normaliza espaços múltiplos duplicados
                        .trim();

                    // Validação: se o texto limpo tiver o tamanho aproximado esperado, manda para a força bruta
                    if (textoCifradoLimpo.length > 2) {
                        console.log(`\n🔥 [C] Mensagem Cifrada Capturada com Sucesso: "${textoCifradoLimpo}"`);
                        executarForcaBruta(textoCifradoLimpo);
                    }
                }
            }
            
            bufferDeRede = ''; // Limpa para a próxima captura
        }, 700);
    }
});