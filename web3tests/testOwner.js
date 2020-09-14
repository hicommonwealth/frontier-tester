const { assert } = require('chai');
const { deployContract, account } = require('../utils');
const OwnerContract = require('../build/contracts/OwnerContract.json');

describe("OwnerContract test", async () => {
  it("should have owner", async () => {
    let c = await deployContract('OwnerContract', OwnerContract);
    let result = await c.methods.makeCall().call({ from: account });
    assert.isTrue(result);
  });

  it("should fail with wrong owner", async () => {
    // NOTE: this will fail, because the error will be:
    //     { code: -32603, message: 'inner executing call failed' }
    // rather than a revert!
    let c = await deployContract('OwnerContract', OwnerContract);
    try {
      await c.methods.makeCall.call({ from: '0xF8cef78E923919054037a1D03662bBD884fF4edf' });
      assert.fail('should throw');
    } catch (e) {
      
    }
  });
});
