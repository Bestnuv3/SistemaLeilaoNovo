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

let auctionData = {
    imageUrl: "",
    value: 0,
    timeLeft: 60,
    bids: []
};

// Iniciar servidor Multicast UDP
udpServer.bind(multicastPort, () => {
    udpServer.addMembership(multicastAddress);
    console.log(`Servidor multicast rodando em ${multicastAddress}:${multicastPort}`);
});

// Função para enviar mensagens multicast
function sendMulticastMessage(data) {
    const message = Buffer.from(JSON.stringify(data));
    udpServer.send(message, 0, message.length, multicastPort, multicastAddress, (err) => {
        if (err) console.error("Erro ao enviar multicast:", err);
    });
}

// Iniciar leilão
app.post("/start-auction", (req, res) => {
    const { imageUrl, value } = req.body;

    if (!imageUrl || !value) {
        return res.status(400).json({ error: "Imagem e valor inicial são obrigatórios" });
    }

    auctionData.imageUrl = imageUrl;
    auctionData.value = value;
    auctionData.timeLeft = 60; // Reinicia o tempo
    auctionData.bids = [];

    // Inicia o timer e envia updates via multicast
    const interval = setInterval(() => {
        auctionData.timeLeft--;

        const message = JSON.stringify(auctionData);
        udpServer.send(message, multicastPort, multicastAddress);

        if (auctionData.timeLeft <= 0) {
            clearInterval(interval);
        }
    }, 1000);

    res.json({ message: "Leilão iniciado!" });
});

// Enviar um lance
app.post("/bid", (req, res) => {
    if (!auctionData.running) {
        return res.json({ message: "O leilão ainda não começou!" });
    }

    const bidIncrement = auctionData.value * 0.1; // Incremento de 10%
    auctionData.currentBid += bidIncrement;

    sendMulticastMessage({ type: "bid", bidValue: auctionData.currentBid });

    res.json({ message: `Lance enviado: R$ ${auctionData.currentBid}` });
});

// Iniciar o servidor HTTP na porta 3000
app.listen(3000, () => console.log("Servidor HTTP rodando na porta 3000"));

// Iniciar o servidor UDP multicast
udpServer.bind(multicastPort, () => {
    udpServer.addMembership(multicastAddress);
    console.log(`Servidor multicast rodando em ${multicastAddress}:${multicastPort}`);
});
