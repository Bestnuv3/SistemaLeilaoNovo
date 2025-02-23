const express = require("express");
const path = require("path");
const dgram = require("dgram");
const fs = require("fs");
const { encryptForClient, decryptFromClient, isClientAuthorized } = require("./cryptoHelper");

const app = express();
const udpServer = dgram.createSocket("udp4");
const multicastAddress = "239.255.255.250"; // Endereço Multicast
const multicastPort = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Servindo arquivos estáticos

// 🔹 Rota para clientes se autenticarem no leilão
app.post("/join-auction", (req, res) => {
    const { clientId, publicKey } = req.body;

    if (!isClientAuthorized(publicKey)) {
        return res.status(403).json({ error: "Acesso negado. Chave pública não autorizada." });
    }

    res.json({ message: "Cliente autenticado com sucesso!" });
});

app.post("/start-auction", (req, res) => {
    console.log("Recebendo requisição para iniciar leilão:", req.body);

    if (!word || isNaN(value) || value <= 0) {
        return res.status(400).json({ error: "A palavra e um valor inicial válido são obrigatórios" });
    }

    auctionData.word = word;
    auctionData.value = parseFloat(value); 
    auctionData.timeLeft = 60;
    auctionData.bids = [];

    console.log("Leilão iniciado com:", auctionData);

    const interval = setInterval(() => {
        auctionData.timeLeft--;

        const encryptedAuctionData = {
            client1: encryptForClient("client1", JSON.stringify(auctionData)),
            client2: encryptForClient("client2", JSON.stringify(auctionData)),
        };

        const message = Buffer.from(JSON.stringify(encryptedAuctionData));

        udpServer.send(message, multicastPort, multicastAddress, (err) => {
            if (err) {
                console.error("Erro ao enviar dados multicast:", err);
            } else {
                console.log("Dados enviados via multicast:", encryptedAuctionData);
            }
        });

        if (auctionData.timeLeft <= 0) {
            clearInterval(interval);
            console.log("Leilão encerrado!");
        }
    }, 1000);

    res.json({ message: "Leilão iniciado!" });
});


// 🔹 Rota para receber lances dos clientes
app.post("/bid", (req, res) => {
    const { clientId, publicKey } = req.body;

    if (!isClientAuthorized(publicKey)) {
        return res.status(403).json({ error: "Acesso negado. Chave pública não autorizada." });
    }

    // 🔹 O lance é sempre 10% acima do valor atual
    const bidAmount = auctionData.value * 1.1;
    auctionData.value = bidAmount;

    auctionData.bids.push({ clientId, bidAmount });

    console.log(`Novo lance de ${clientId}: R$ ${bidAmount}`);

    // 🔹 Envia o lance atualizado para os clientes
    const encryptedAuctionData = {
        client1: encryptForClient("client1", JSON.stringify(auctionData)),
        client2: encryptForClient("client2", JSON.stringify(auctionData)),
    };

    const message = Buffer.from(JSON.stringify(encryptedAuctionData));
    udpServer.send(message, multicastPort, multicastAddress);

    res.json({ message: "Lance registrado com sucesso!" });
});

// 🔹 Iniciar servidor HTTP
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));

// 🔹 Iniciar servidor UDP Multicast
udpServer.bind(multicastPort, () => {
    udpServer.addMembership(multicastAddress);
    console.log(`Servidor multicast rodando em ${multicastAddress}:${multicastPort}`);
});
