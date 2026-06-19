const ALFABETO_REAL =  'abcdefghijklmnopqrstuvwxyz';
const ALFABETO_CIFRA = 'zebrasdfghijklmnopqtuvwxyz'; // A chave secreta de A e B

function cifrar(texto) {
    return texto.toLowerCase().split('').map(char => {
        const idx = ALFABETO_REAL.indexOf(char);
        return idx !== -1 ? ALFABETO_CIFRA[idx] : char; // Mantém espaços/pontuação
    }).join('');
}

function descriptografar(texto, chaveUsada = ALFABETO_CIFRA) {
    return texto.toLowerCase().split('').map(char => {
        const idx = chaveUsada.indexOf(char);
        return idx !== -1 ? ALFABETO_REAL[idx] : char;
    }).join('');
}

module.exports = { cifrar, descriptografar };