const { assert } = require("chai");
const TimeContract = require("../build/contracts/TimeContract.json");
const { deployContract, account } = require('../utils');

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function blockTimeifyDate(n) {
  return Math.floor(n / 6000) * 6000;
}

describe("TimeContract test", async () => {
  it("should be testable", async () => {
    let t = await deployContract('TimeContract', TimeContract);

    await t.methods.timeBeforeEnd().send({ from: account });

    // fetch initial values
    let now = await t.methods.viewNow().call({ from: account });
    assert.equal(blockTimeifyDate(Date.now()).toString(), now.toString());

    // wait 4s
    await timeout(4000);
    const now2 = await t.methods.viewNow().call({ from: account });
    assert.equal(blockTimeifyDate(Date.now()).toString(), now2.toString());

    // wait 4s
    await timeout(4000);
    const now3 = await t.methods.viewNow().call({ from: account });
    assert.equal(blockTimeifyDate(Date.now()).toString(), now3.toString());
  });
});
