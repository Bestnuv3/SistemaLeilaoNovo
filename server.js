const express = require("express");
const path = require("path");

const app = express();
const dgram = require("dgram");

const multicastAddress = "239.255.255.250"; // Endereço Multicast
const multicastPort = 5000;
const udpServer = dgram.createSocket("udp4");

app.use(express.json());

// 🔹 **Aqui servimos os arquivos estáticos (server.html e client.html)**
app.use(express.static(path.join(__dirname, "public")));

// 🔹 **Agora o navegador pode acessar `server.html` e `client.html` diretamente**
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "server.html"));
});

// Iniciar servidor HTTP
app.listen(3000, () => console.log("Servidor HTTP rodando em http://localhost:3000"));

// Iniciar servidor Multicast UDP
udpServer.bind(multicastPort, () => {
    udpServer.addMembership(multicastAddress);
    console.log(`Servidor multicast rodando em ${multicastAddress}:${multicastPort}`);
});
