const EdgewarePrivateKeyProvider = require ('./private-provider')
var edgewarePrivateKey = "99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "cushion member minute around tired true over mad fun drip ginger auto horse abuse uphold";

module.exports = {
  compilers: {
    solc: {
      version: "=0.5.16"
    }
  },
  networks: {
    development: {
      provider: () => new EdgewarePrivateKeyProvider(edgewarePrivateKey, "http://localhost:9933/", 42),
      network_id: 42
    },
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/b19b8175e688448ead43a0ab5f03438a", 0),
      network_id: 3
    }
  }
}
