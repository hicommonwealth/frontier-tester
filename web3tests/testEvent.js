const { assert } = require('chai');
const Web3 = require('web3');
const EventContract = require('../build/contracts/EventContract.json');
const { deployContract, account, initWeb3, privKey } = require('../utils');
const sub_account = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
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

  it('should receive event thru web3 subscribe', async () => {
    // init with wsprovider
    const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:9944/"));
    web3.eth.accounts.wallet.add(privKey);
    web3.eth.defaultAccount = account;
    const c = await deployContract('EventContract', EventContract, [], web3);
    const cAddress = c._address;

    // init subscription
    await new Promise(async (resolve, reject) => {
      c.events.allEvents((error, data) => {
        assert.equal(data.event, 'e');
        assert.equal(data.address, cAddress);
      })
      .on('data', (data) => {
        assert.equal(data.event, 'e');
        assert.equal(data.address, cAddress);
        resolve();
      })
      .on('error', (err) => {
        console.error(err);
        reject();
      });

      // initialize another web3 connection with dev signer and fire tx'es to subscribe to
      const anotherWeb3 = initWeb3();
      let EC = contract({
        abi: EventContract.abi,
        unlinked_binary: EventContract.bytecode,
      });
      EC.setProvider(anotherWeb3.currentProvider);
      try {
        const cc = await EC.at(cAddress);
        const nonce = await anotherWeb3.eth.getTransactionCount(account);
        const tx = await cc.emitEvent({ from: account, nonce: nonce + 1 });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  })
});
