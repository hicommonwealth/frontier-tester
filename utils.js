const EdgewarePrivateKeyProvider = require('./private-provider');
const Web3 = require('web3');
const { decodeAddress, encodeAddress, blake2AsHex } = require('@polkadot/util-crypto');

// const account = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
const account = '0x19e7e376e7c213b7e7e7e46cc70a5dd086daff2a';
const privKey = '99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342';

const initWeb3 = (pkey = privKey) => {
  //const provider = new EdgewarePrivateKeyProvider(pkey, "http://localhost:9933/", 42);
  const provider = new Web3.providers.HttpProvider('http://localhost:9933/');
  const web3 = new Web3(provider);
  return web3;
};

const initProvider = (pkey = privKey) => {
  return new EdgewarePrivateKeyProvider(pkey, "http://localhost:9933/", 42);
};

const deployContract = async (name, c, args = [], web3 = undefined) => {
  if (!web3) {
    web3 = initWeb3();
  }
  console.log(`Attempting to deploy ${name} from account: ${account}`);
  const contract = new web3.eth.Contract(c.abi);

  const contractTx = contract.deploy({
     data: c.bytecode,
     arguments: args,
  });

  const data = contractTx.encodeABI();
  const createTransaction = await web3.eth.accounts.signTransaction(
     {
        from: account,
        data,
        gasLimit: 8000000,
        gasPrice: 1000000000,
     },
     privKey
  );

  const createReceipt = await web3.eth.sendSignedTransaction(
     createTransaction.rawTransaction
  );
  console.log(`${name} deployed at address ${createReceipt.contractAddress}`);
  return new web3.eth.Contract(c.abi, createReceipt.contractAddress);
};

const convertToEvmAddress = (substrateAddress) => {
  const addressBytes = decodeAddress(substrateAddress);
  return '0x' + Buffer.from(addressBytes.subarray(0, 20)).toString('hex');
}

const convertToSubstrateAddress = (evmAddress, prefix = 42) => {
  const addressBytes = Buffer.from(evmAddress.slice(2), 'hex');
  const prefixBytes = Buffer.from('evm:');
  const convertBytes = Uint8Array.from(Buffer.concat([ prefixBytes, addressBytes ]));
  const finalAddressHex = blake2AsHex(convertBytes, 256);
  return encodeAddress(finalAddressHex, prefix);
}

module.exports = {
  account,
  privKey,
  initWeb3,
  initProvider,
  deployContract,
  convertToEvmAddress,
  convertToSubstrateAddress,
}
