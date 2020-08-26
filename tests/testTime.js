const TimeContract = artifacts.require("TimeContract");

contract("TimeContract test", async (accounts) => {
  it("should be testable", async () => {
    let time = await TimeContract.deployed();
    let isTestable = await time.isTestable.call();
    assert.isTrue(isTestable);
    let isBlockTestable = await time.isBlockTestable.call();
    assert.isTrue(isBlockTestable);

    // TODO: test after timeout
    // TODO: fail test
  });
});
