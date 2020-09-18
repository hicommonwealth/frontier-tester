const { assert } = require("chai");
const rlp = require('rlp');
const keccak = require('keccak');
const { deployContract, account, initWeb3, initProvider } = require('../utils');

const CreateContract = require('../build/contracts/CreateContract.json');
const SubContract = require('../build/contracts/SubContract.json');
const contract = require("@truffle/contract");

describe("CreateContract test", async () => {
  it("should spawn subcontract", async () => {
    const web3 = initWeb3();

    let Create = contract({
      abi: CreateContract.abi,
      unlinked_binary: CreateContract.bytecode,
    });
    Create.setProvider(web3.currentProvider);

    let c = await Create.new({ from: account });
    let startNonce = await web3.eth.getTransactionCount(c.address);
    // create without value
    let receipt = await c.spawn({ from: account });
    let address = await c.deployed.call({ from: account });
    console.log(receipt);

    var Sub = contract({
      abi: SubContract.abi,
      unlinked_binary: SubContract.bytecode,
    });
    Sub.setProvider(web3.currentProvider);
    let cSub = await Sub.at(address);
    let balance = await cSub.getValue.call({ from: account });
    assert.equal(balance, '0', 'balance of deployed subcontract should be 0');
    console.log('deployed address no value')
    console.log(address);

    // check nonce
    let nonce = await web3.eth.getTransactionCount(c.address);
    assert.equal(nonce, startNonce + 1, 'contract nonce should increment');
    console.log('nonce');
    console.log(nonce);

    const input_1 = [ c.address, startNonce.toString(16) ];
    const rlpEncoded_1 = rlp.encode(input_1);
    const contractAddressLong_1 = keccak('keccak256').update(rlpEncoded_1).digest('hex');
    const contractAddr_1 = contractAddressLong_1.substring(24);
    console.log('subcontract addr with nonce 1');
    console.log(contractAddr_1);

    const input_2 = [ c.address, (startNonce + 1).toString(16)];
    const rlpEncoded_2 = rlp.encode(input_2);
    const contractAddressLong_2 = keccak('keccak256').update(rlpEncoded_2).digest('hex');
    const contractAddr_2 = contractAddressLong_2.substring(24);
    console.log('subcontract addr with nonce 2');
    console.log(contractAddr_2);

    // /*
    //   Unsure if the contract nonce incrememts before or after
    // */
    // assert.equal('0x' + contractAddr_2, address.toLowerCase(), 'deployed addreses should match actually deployed ');

    // // create with value
    // const value = web3.utils.toWei('10', 'ether');
    // await c.spawnWithValue().send({ value, from: account });
    // address = await c.deployed(1).call({ from: account });
    // console.log('deployedAddr with value');
    // console.log(address);
    // let sub2 = new web3.eth.Contract(SubContract.abi, address);
    // assert.notEqual(sub2.address, sub.address, 'new subcontract should have different address');
    // let balance2 = await sub2.getValue().call({ from: account });
    // assert.equal(balance2, value, 'new subcontract should have balance paid to it');
    // balance = await sub.getValue().call({ from: account });
    // assert.equal(balance, '0', 'balance of old subcontract should still be 0');

    // // check nonce
    // nonce = await web3.eth.getTransactionCount(c.address);
    // assert.equal(nonce, startNonce + 2, 'contract nonce should increment twice');
    // console.log('nonce2');
    // console.log(nonce);

    // const input_3 = [ c.address, (startNonce + 2).toString(16) ];
    // const rlpEncoded_3 = rlp.encode(input_3);
    // const contractAddressLong_3 = keccak('keccak256').update(rlpEncoded_3).digest('hex');
    // const contractAddr_3 = contractAddressLong_3.substring(24);
    // console.log('subcontract addr with nonce 3');
    // console.log(contractAddr_3);
  
    // assert.equal('0x' + contractAddr_3, address.toLowerCase(), 'second deployed addreses should match actually deployed');
  });
});
