const { assert } = require('chai');
const EventContract = require('../build/contracts/EventContract.json');
const { deployContract, account, initWeb3 } = require('../utils');
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
    const c = await deployContract('EventContract', EventContract);

    // init subscription
    const subP = new Promise((resolve) => {
      c.once('e', (err, eventData) => {
        if (err) {
          assert.fail(err.message);
        } else {
          console.log(eventData);
          resolve();
        }
      });
    })

    // make the call
    await c.methods.emitEvent().send({ from: account });
    await subP;
  })
});