const Lockdrop = artifacts.require("Lockdrop");
const BN = web3.utils.BN;
const { toWei, padRight } = web3.utils;
const utility = require('../helpers/util');
const ldHelpers = require('../helpers/lockdropHelper');
const rlp = require('rlp');
const keccak = require('keccak');
const { assert } = require('chai');

contract("Lockdrop test", async (accounts) => {
  const SECONDS_IN_DAY = 86400;
  const THREE_MONTHS = 0;
  const SIX_MONTHS = 1;
  const TWELVE_MONTHS = 2;

  let lockdrop;

  beforeEach(async function() {
    let time = await utility.getCurrentTimestamp(web3);
    lockdrop = await Lockdrop.new(time);
  });

  // it('should setup and pull constants', async function () {
  //   let LOCK_DROP_PERIOD = (await lockdrop.LOCK_DROP_PERIOD()).toNumber();
  //   let LOCK_START_TIME = (await lockdrop.LOCK_START_TIME()).toNumber();
  //   let time = await utility.getCurrentTimestamp(web3);
  //   assert.equal(LOCK_DROP_PERIOD, SECONDS_IN_DAY * 92);
  //   assert.ok(LOCK_START_TIME <= time && time <= LOCK_START_TIME + 1000);
  // });

  // it('ensure the contract address matches JS RLP script', async function () {
  //   const sender = accounts[0];
  //   const nonce = (await web3.eth.getTransactionCount(sender));
  //   const input = [ sender, nonce ];
  //   const rlpEncoded = rlp.encode(input);
  //   const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex');
  //   const contractAddr = contractAddressLong.substring(24);

  //   let time = await utility.getCurrentTimestamp(web3);
  //   let tempLd = await Lockdrop.new(time);
  //   assert.equal(web3.utils.toBN(tempLd.address).toString(), web3.utils.toBN(contractAddr).toString());
  // });
  
  // Events don't work
  it('should lock funds and increment nonce', async function () {
    console.log('lockdrop.address');
    console.log(lockdrop.address);

    let startNonce = await web3.eth.getTransactionCount(lockdrop.address);
    console.log('startNonce');
    console.log(startNonce);
    assert.equal(startNonce, '1', 'start nonce of deployed contract should be 1');

    let senderBalance = await web3.eth.getBalance(accounts[0]);
    console.log('senderBalance');
    console.log(senderBalance);

    const binput1 = [ lockdrop.address, startNonce ];
    const brlpEncoded1 = rlp.encode(binput1);
    const bcontractAddressLong1 = keccak('keccak256').update(brlpEncoded1).digest('hex');
    const bcontractAddr1 = bcontractAddressLong1.substring(24);
    console.log('lock addr with nonce 1');
    console.log(bcontractAddr1);

    const binput2 = [ lockdrop.address, startNonce + 1 ];
    const brlpEncoded2 = rlp.encode(binput2);
    const bcontractAddressLong2 = keccak('keccak256').update(brlpEncoded2).digest('hex');
    const bcontractAddr2 = bcontractAddressLong2.substring(24);
    console.log('expected lock addr');
    console.log(bcontractAddr2);

    await lockdrop.lock(THREE_MONTHS, accounts[0], true, {
      from: accounts[0],
      value: 1,
      gas: 1500000,
      gasPrice: 1000000000,
    });

    let balLock1 = await web3.eth.getBalance(bcontractAddr1);
    let balLock2 = await web3.eth.getBalance(bcontractAddr2);
    console.log('balance at nonce 1');
    console.log(balLock1);
    console.log('balance at nonce 2');
    console.log(balLock2)

    let senderBalanceAfter = await web3.eth.getBalance(accounts[0]);

    console.log(senderBalance - senderBalanceAfter)
    assert.isAtLeast(senderBalance - senderBalanceAfter, `${toWei(1)}`, 'sent balance should be greater than lock value');

    const nonce = (await web3.eth.getTransactionCount(lockdrop.address));
    const input = [ lockdrop.address, nonce ];
    const rlpEncoded = rlp.encode(input);
    const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex');
    const contractAddr = contractAddressLong.substring(24);
    console.log('after lock nonce');
    console.log(nonce);
    assert.equal(nonce, 2, 'contract nonce of deployed contract should be 2 after lock')

    const bal0 = await web3.eth.getBalance(contractAddr);
    assert.equal(bal0, 1, 'Lock value should be 1 after lock')
    console.log('contractAddr')   
    console.log(contractAddr)
    console.log('contractBal')   
    console.log(bal0)

    const input1 = [ lockdrop.address, nonce - 1 ];
    const rlpEncoded1 = rlp.encode(input1);
    const contractAddressLong1 = keccak('keccak256').update(rlpEncoded1).digest('hex');
    const contractAddr1 = contractAddressLong1.substring(24);

    // const bal = await web3.eth.getBalance(contractAddr1);
    // assert.equal(bal, 1, 'Lock value should be 0 after lock')
  });

  // it("should have lock at different Lock Contracts and increment Lockdrop nonce", async () => {
  //   let startNonce = await web3.eth.getTransactionCount(lockdrop.address);
  //   console.log('startNonce');
  //   console.log(startNonce);
  //   assert.equal(startNonce, '1', 'start nonce of deployed contract should be 1');

  //   // create first value
  //   await lockdrop.lock(THREE_MONTHS, accounts[0], true, {
  //     from: accounts[0],
  //     value: 1,
  //   });

  //   const nonce = (await web3.eth.getTransactionCount(lockdrop.address));
  //   const input = [ lockdrop.address, nonce ];
  //   const rlpEncoded = rlp.encode(input);
  //   const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex');
  //   const contractAddr = contractAddressLong.substring(24);
  //   console.log('after lock nonce');
  //   console.log(nonce);
  //   assert.equal(nonce, '2', 'contract nonce of deployed contract should be 2 after lock')

  //   const bal0 = await web3.eth.getBalance(contractAddr);
  //   assert.equal(bal0, '1', 'Lock value should be 1 after lock')

  //   const input1 = [ lockdrop.address, startNonce + 1 ];
  //   const rlpEncoded1 = rlp.encode(input1);
  //   const contractAddressLong1 = keccak('keccak256').update(rlpEncoded1).digest('hex');
  //   const contractAddr1 = contractAddressLong1.substring(24);

  //   // Lock Address Nonce should be what we expect
  //   assert.equal(web3.utils.toBN(contractAddr1).toString(), web3.utils.toBN(contractAddr).toString());
    
  //   // create second lock
  //   await lockdrop.lock(THREE_MONTHS, accounts[0], true, {
  //     from: accounts[0],
  //     value: 100,
  //   });

  //   const nonce2 = (await web3.eth.getTransactionCount(lockdrop.address));
  //   const input2 = [ lockdrop.address, nonce2 ];
  //   const rlpEncoded2 = rlp.encode(input2);
  //   const contractAddressLong2 = keccak('keccak256').update(rlpEncoded2).digest('hex');
  //   const contractAddr2 = contractAddressLong2.substring(24);
  //   assert.equal(nonce2, '3', 'contract nonce of deployed contract should be 3 after lock')

  //   const bal = await web3.eth.getBalance(contractAddr);
  //   assert.equal(balance, '1', 'Lock value of first lock should still be 1 after second lock')

  //   const bal2 = await web3.eth.getBalance(contractAddr2);
  //   assert.equal(bal2, '100', 'Lock value of second lock should be 100 after second lock')

  //   const input3 = [ lockdrop.address, startNonce + 2 ];
  //   const rlpEncoded3 = rlp.encode(input3);
  //   const contractAddressLong3 = keccak('keccak256').update(rlpEncoded3).digest('hex');
  //   const contractAddr3 = contractAddressLong3.substring(24);

  //   // Lock Address Nonce should be what we expect
  //   assert.equal(web3.utils.toBN(contractAddr3).toString(), web3.utils.toBN(contractAddr2).toString());
  // });
});
