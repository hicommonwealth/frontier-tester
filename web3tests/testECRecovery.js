const { assert } = require('chai');
const contract = require("@truffle/contract");
const { account, initWeb3 } = require('../utils');
const ECRecovery = require('../build/contracts/ECRecovery.json');

describe('ECRecovery test', async () => {
  it('should recover account from signature and hash', async () => {
    const web3 = initWeb3();

    // deploy contract
    const ECR = contract({
      abi: ECRecovery.abi,
      unlinked_binary: ECRecovery.bytecode,
    });
    ECR.setProvider(web3.currentProvider);

    const c = await ECR.new({ from: account });

    // prepare a signed message
    const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Eaedem res maneant alio modo.'
    const messageHex = '0x' + Buffer.from(message).toString('hex');
    const signature = await web3.eth.sign(messageHex, account);
    const hash = web3.utils.sha3('\x19Ethereum Signed Message:\n' + message.length + message);
    
    // recover the signer
    const address = await c.recover.call(hash, signature, { from: account });
    assert.equal(address, account);
  });
});
