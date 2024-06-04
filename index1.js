
const nearAPI = require("near-api-js");
const fs = require("fs");
const { connect, keyStores, WalletConnection, KeyPair, transactions } = nearAPI;

// JSON dosyasından anahtarları yükleme
const keyFile = "key.json";
const keyData = JSON.parse(fs.readFileSync(keyFile, "utf-8"));

// InMemoryKeyStore oluşturma ve anahtarları ekleme
const keyStore = new keyStores.InMemoryKeyStore();
const keyPair = KeyPair.fromString(keyData.private2_key);
keyStore.setKey("default", keyData.account2_id, keyPair);

// NEAR ağını özel RPC ile yapılandırma
const config = {
  networkId: "default",
  keyStore,
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
  providers:"https://near-testnet.lava.build/lava-referer-3650aed7-0dbd-44d6-a6a5-c6c63951ae4f/"
};

// Bağlantıyı başlatma
async function initNear() {
  try {
    const near = await connect(config);
    const wallet = new WalletConnection(near, "my-app"); // "my-app" uygulama anahtar ön ekini tanımlar

    return { near, wallet };
  } catch (error) {
    console.error("NEAR bağlantısı kurulamadı:", error);
  }
}

initNear().then(({ near, wallet }) => {
  console.log("NEAR bağlantısı kuruldu!");
}).catch((error) => {
  console.error("NEAR bağlantısı kurulamadı:", error);
});

async function createTransaction(senderAccountId, receiverAccountId, amount) {
  try {
    const { near } = await initNear();
    const sender = await near.account(senderAccountId);

    // İşlem verilerini hazırlama
    const actions = [
      transactions.transfer(amount),
    ];

    // İşlemi oluşturma ve gönderme
    const result = await sender.signAndSendTransaction({
      receiverId: receiverAccountId,
      actions,
    });

    console.log("İşlem sonucu:", result.transaction_outcome);
  } catch (error) {
    console.error("İşlem başarısız:", error);
  }
}

// Örnek kullanımı
const senderAccountId = keyData.account2_id; // JSON dosyasındaki hesap kimliğini kullanıyoruz
const receiverAccountId = keyData.account1_id;
const amount = "1000000000000000000000"; // 1 NEAR (10^24 yoctoNEAR)

setInterval(() => {
  createTransaction(senderAccountId, receiverAccountId, amount).catch((error) => {
    console.error("İşlem başarısız:", error);
  });
}, 1000);