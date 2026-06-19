const { spawn } = require('child_process');

console.log('[C] Iniciando ataque de força bruta via escuta de rede...');

const ALFABETO_REAL = 'abcdefghijklmnopqrstuvwxyz';
const DICIONARIO = ['ataque', 'amanhecer', 'base', 'ajuda', 'recuar', 'ao'];

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
        
        if (palavrasEncontradas.length >= 2) { 
            console.log(`\n[C] SUCESSO COMPLETO NA QUEBRA!`);
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

// Inicializa o tcpdump
const tcpdump = spawn('tcpdump', ['-l', '-A', 'port', '3000']);
let bufferDeRede = '';

tcpdump.stdout.on('data', (data) => {
    bufferDeRede += data.toString();

    // Quando o tráfego terminar de passar
    if (bufferDeRede.includes('POST / HTTP')) {
        setTimeout(() => {
            // Dividimos todas as linhas capturadas na rede
            const linhas = bufferDeRede.split('\n');
            
            // FILTRO INTELIGENTE: Vamos procurar qual linha contém o payload real (sem os pontos do tcpdump)
            let textoCifradoDetectado = '';
            for (let linha of linhas) {
                linha = linha.trim();
                // Procura uma linha que tenha letras e espaços, ignorando as linhas de pontos de rede
                if (linha.length > 5 && !linha.includes('..') && !linha.includes('HTTP') && !linha.includes('Host:')) {
                    textoCifradoDetectado = linha;
                }
            }

            if (textoCifradoDetectado) {
                console.log(`\n [C] Mensagem Cifrada Capturada com Sucesso: "${textoCifradoDetectado}"`);
                executarForcaBruta(textoCifradoDetectado);
            } else {
                console.log('\n [C] Tráfego interceptado, mas não foi possível isolar o texto limpo da rede.');
            }

            bufferDeRede = ''; // Limpa o buffer para o próximo teste
        }, 600);
    }
});