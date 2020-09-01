const { assert } = require("chai");

const TimeContract = artifacts.require("TimeContract");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function blockTimeifyDate(n) {
  return Math.floor(n / 6000) * 6000;
}

contract("TimeContract test", async (accounts) => {
  it("should be testable", async () => {
    let t = await TimeContract.deployed();

    // fetch initial values
    let now = await t.viewNow.call();
    assert.equal(blockTimeifyDate(Date.now()).toString(), now.toString());

    // wait 4s
    await timeout(4000);
    const now2 = await t.viewNow.call();
    assert.equal(blockTimeifyDate(Date.now()).toString(), now2.toString());

    // wait 4s
    await timeout(4000);
    const now3 = await t.viewNow.call();
    assert.equal(blockTimeifyDate(Date.now()).toString(), now3.toString());
  });
});
