const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const REAL_KEY = 'QWERTYUIOPASDFGHJKLZXCVBNM';

function encrypt(text, key = REAL_KEY) {
    return text.toUpperCase().split('').map(char => {
        const index = ALPHABET.indexOf(char);
        return index !== -1 ? key[index] : char;
    }).join('');
}

function decrypt(cipherText, key = REAL_KEY) {
    return cipherText.toUpperCase().split('').map(char => {
        const index = key.indexOf(char);
        return index !== -1 ? ALPHABET[index] : char;
    }).join('');
}

module.exports = { ALPHABET, REAL_KEY, encrypt, decrypt };