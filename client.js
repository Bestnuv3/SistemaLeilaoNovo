const { decryptFromClient } = require("./cryptoHelper");
const clientPrivateKey = fs.readFileSync("./keys/client1_private.pem", "utf8"); // Altere para client2 se for o segundo cliente
const fs = require("fs");

// Cliente se autentica no servidor
fetch("http://localhost:3000/join-auction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: "client1", publicKey: fs.readFileSync("./keys/client1_public.pem", "utf8") })
})
.then(response => response.json())
.then(data => {
    if (data.error) {
        console.error("Falha na autenticação:", data.error);
    } else {
        console.log("Autenticado com sucesso:", data.message);
    }
});

// Cliente escuta mensagens multicast
udpClient.on("message", (msg) => {
    const encryptedData = JSON.parse(msg.toString());
    const decryptedAuctionData = decryptFromClient(encryptedData.client1); // Altere para client2 se for o segundo cliente
    
    console.log("Dados do leilão recebidos:", JSON.parse(decryptedAuctionData));
});
