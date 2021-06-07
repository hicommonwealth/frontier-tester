const Lockdrop = require("../build/contracts/Lockdrop.json");
const utility = require('../helpers/util');
const rlp = require('rlp');
const keccak = require('keccak');
const { assert } = require('chai');
const contract = require("@truffle/contract");
const { deployContract, account, initWeb3, GAS_PRICE, GAS_LIMIT } = require('../utils');

describe("Lockdrop test", async () => {
  const SECONDS_IN_DAY = 86400;
  const THREE_MONTHS = 0;
  const SIX_MONTHS = 1;
  const TWELVE_MONTHS = 2;
  let LD;
  let web3;

  before(async function() {
    web3 = initWeb3();

    LD = contract({
      abi: Lockdrop.abi,
      unlinked_binary: Lockdrop.bytecode,
    });
    LD.setProvider(web3.currentProvider);
  });

  it('should setup and pull constants', async function () {
    let time = await utility.getCurrentTimestamp(web3);
    let lockdrop = await LD.new(time, { from: account });
    const LOCK_DROP_PERIOD = (await lockdrop.LOCK_DROP_PERIOD.call({ from: account })).toNumber();
    const LOCK_START_TIME = (await lockdrop.LOCK_START_TIME.call({ from: account })).toNumber();
    time = await utility.getCurrentTimestamp(web3);
    assert.equal(LOCK_DROP_PERIOD, SECONDS_IN_DAY * 92);
    assert.ok(LOCK_START_TIME <= time && time <= LOCK_START_TIME + 1000);
  });

  it('ensure the contract address matches JS RLP script', async function () {
    let time = await utility.getCurrentTimestamp(web3);
    let lockdrop = await LD.new(time, { from: account });
    const sender = account;
    const nonce = (await web3.eth.getTransactionCount(sender));
    const input = [ sender, nonce - 1 ];
    const rlpEncoded = rlp.encode(input);
    const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex');
    const contractAddr = contractAddressLong.substring(24);

    time = await utility.getCurrentTimestamp(web3);
    assert.equal(web3.utils.toBN(lockdrop.address).toString(), web3.utils.toBN(contractAddr).toString());
  });

  it('should lock funds and increment nonce', async function () {
    let time = await utility.getCurrentTimestamp(web3);
    let lockdrop = await LD.new(time, { from: account });

    let startNonce = await web3.eth.getTransactionCount(lockdrop.address);
    assert.equal(startNonce, '1', 'start nonce of deployed contract should be 1');

    let senderBalance = await web3.eth.getBalance(account);
    const value = web3.utils.toWei('10', 'ether');

    // first lock
    const receipt = await lockdrop.lock(THREE_MONTHS, account, true, {
      from: account,
      value: value,
      gas: GAS_LIMIT,
      gasPrice: 1000,
    });

    // check returned events
    const args = receipt.logs[0].args;
    assert.equal(args.term, THREE_MONTHS);
    assert.equal(args.eth, value);
    assert.equal(args.owner.toLowerCase(), account.toLowerCase());

    // check correct amount in lock contract
    const lockAddr = args.lockAddr;
    let balLockAddr = await web3.eth.getBalance(lockAddr);
    assert.equal(balLockAddr, value);

    // check correct amount in sender
    let senderBalanceAfter = await web3.eth.getBalance(account);
    assert.isAtLeast(Number(senderBalance - senderBalanceAfter), Number(value), 'sent balance should be greater than lock value');

    // check nonce
    // Contract nonces are reset after spawning new contracts with value, so this
    // returns 0 for now: https://github.com/paritytech/frontier/issues/286
    const nonce = (await web3.eth.getTransactionCount(lockdrop.address));
    // assert.equal(nonce, '2', 'contract nonce of Lockdrop contract should be 2 after lock')
    assert.equal(nonce, 0, 'contract nonce of Lockdrop contract should be 0 after lock')

    // second lock
    const value2 = web3.utils.toWei('100', 'ether');
    const receipt2 = await lockdrop.lock(THREE_MONTHS, account, true, {
      from: account,
      value: value2,
      gas: GAS_LIMIT,
      gasPrice: 1000000000,
    });
    const args2 = receipt2.logs[0].args;
    const lockAddr2 = args2.lockAddr;

    // check lock balance
    const bal2 = await web3.eth.getBalance(lockAddr2);
    assert.equal(bal2, value2, '2nd lock value should be non zero after lock');

    // check nonce
    const new_nonce = (await web3.eth.getTransactionCount(lockdrop.address));
    // assert.equal(new_nonce, '3', 'nonce should increment');
    assert.equal(new_nonce, 0);
  });
});
