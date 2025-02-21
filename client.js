const dgram = require("dgram");
const client = dgram.createSocket("udp4");

const MULTICAST_ADDR = "239.255.255.250";
const PORT = 5000;

client.on("listening", () => {
    client.setBroadcast(true);
    client.setMulticastTTL(128);
    client.addMembership(MULTICAST_ADDR);
    console.log(`Cliente escutando em ${MULTICAST_ADDR}:${PORT}`);
});

client.on("message", (message, remote) => {
    const data = JSON.parse(message.toString());

    if (data.type === "start") {
        console.log(`Novo leilão iniciado! Imagem: ${data.imageUrl}, Valor: R$${data.value}`);
    } else if (data.type === "timer") {
        console.log(`Tempo restante: ${data.timeLeft}s`);
    } else if (data.type === "end") {
        console.log("Leilão encerrado!");
    }
});

client.bind(PORT);
