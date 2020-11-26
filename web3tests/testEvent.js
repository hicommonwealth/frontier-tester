const { assert } = require('chai');
const Web3 = require('web3');
const EventContract = require('../build/contracts/EventContract.json');
const { deployContract, account, initWeb3, privKey } = require('../utils');
const contract = require("@truffle/contract");

describe("EventContract test", async () => {
  it("should emit event", async () => {
    const web3 = initWeb3();
    let EC = contract({
      abi: EventContract.abi,
      unlinked_binary: EventContract.bytecode,
    });
    EC.setProvider(web3.currentProvider);
    let c = await EC.new({ from: account });
    let res = await c.emitEvent({ from: account });
    assert.equal(res.receipt.logs.length, 1);
    assert.equal(res.receipt.logs[0].event, 'e');
  });

  // it('should receive event thru web3 subscribe', async () => {
  //   // init with wsprovider
  //   const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:9944/"));
  //   web3.eth.accounts.wallet.add({
  //     privateKey: privKey,
  //     address: account,
  //   });
  //   const c = await deployContract('EventContract', EventContract, [], web3);

  //   // init subscription
  //   await new Promise(async (resolve) => {
  //     c.events.e().on('data', (data) => {
  //       console.log(data);
  //       resolve();
  //     });

  //     // make the tx
  //     // NOTE: we cannot use .send() because `sendTransaction` is not supported
  //     const tx = c.methods.emitEvent();
  //     const data = tx.encodeABI();
  //     const signedTx = await web3.eth.accounts.signTransaction(
  //       {
  //         from: account,
  //         data,
  //         gasLimit: 8000000,
  //         gasPrice: 1000000000,
  //       },
  //       privKey
  //     );
  //     const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  //   });
  // })
});
