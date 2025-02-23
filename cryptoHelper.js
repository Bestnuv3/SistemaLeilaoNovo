const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Carregar chaves públicas dos clientes
const clientPublicKeys = {
    "client1": fs.readFileSync(path.join(__dirname, "keys", "client1_public.pem"), "utf8"),
    "client2": fs.readFileSync(path.join(__dirname, "keys", "client2_public.pem"), "utf8"),
};

// Chave privada do servidor
const serverPrivateKey = fs.readFileSync(path.join(__dirname, "keys", "server_private.pem"), "utf8");

// Função para verificar se o cliente é autorizado
function isClientAuthorized(clientPublicKey) {
    return Object.values(clientPublicKeys).includes(clientPublicKey);
}

// Função para criptografar usando a chave pública do cliente
function encryptForClient(clientId, message) {
    if (!clientPublicKeys[clientId]) {
        throw new Error("Cliente não autorizado");
    }
    return crypto.publicEncrypt(clientPublicKeys[clientId], Buffer.from(message)).toString("base64");
}

// Função para descriptografar usando a chave privada do servidor
function decryptFromClient(encryptedMessage) {
    return crypto.privateDecrypt(serverPrivateKey, Buffer.from(encryptedMessage, "base64")).toString("utf8");
}

module.exports = { encryptForClient, decryptFromClient, isClientAuthorized };
