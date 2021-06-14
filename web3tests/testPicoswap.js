// These tests require a local Pico deployment
// at the contract addresses specified below

const contract = require("@truffle/contract");
const { assert } = require("chai");
const { account, initWeb3 } = require('../utils');
const { deploy } = require('../deploy');

const TokenA = require('../build/contracts/TokenA.json');
const TokenB = require('../build/contracts/TokenB.json');

const WETH9Meta = require('../node_modules/canonical-weth/build/contracts/WETH9.json');

const SerranoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Serrano.json');
const ShishitoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Shishito.json');
const JalapenoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Jalapeno.json');
const HabaneroMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Habanero.json');
const PoblanoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Poblano.json');

const UniswapV2Router02 = require('../node_modules/@picoswap/pico-v2-core/deployments/beresheet/UniswapV2Router02.json');
const UniswapV2Factory = require('../node_modules/@picoswap/pico-v2-core/deployments/beresheet/UniswapV2Factory.json');
const UniswapV2Pair = require('../node_modules/@picoswap/pico-v2-core/deployments/beresheet/UniswapV2Pair.json');

describe('Add Liquidity Test', () => {
  let WEDG9_ADDRESS = '0x05df5B40D6806f4c9A933e77b390AD7Bd373aDd4';
  let MULTICALL_ADDRESS = '0xF811AB52f26FF9B68b890f36a6BabB0C47e924df';
  let SERRANO_ADDRESS = '0xf83148cc489f7CA102D2F44A943eCE4DC2953C73';
  let JALAPENO_ADDRESS = '0x4679064F1740ab564ce39473c824572d2Fea26A2';
  let HABANERO_ADDRESS = '0xCAd71203E80D3fAa4b48c34Ec0cD113A04148ee6';
  let SHISHITO_ADDRESS = '0x25CB1a7d342A5F1FC5f170b31Bfb22b5505e67A3';
  let POBLANO_ADDRESS = '0x4f396293F489dd8B344F1fDA416D39Cf728fb389';

  let FACTORY_ADDRESS = '0x072264cD573d2cee4844b17Fe0456F3fDA598124';
  let ROUTER_ADDRESS = '0x93aa2e8E03A26022f1896762896DB5278e3aE5DF';

  it('should create uniswap pair', async () => {
    // deploy two tokens
    const web3 = initWeb3();
    const value = web3.utils.toWei('10', 'ether');
    const amount0 = web3.utils.toWei('0.000001');
    const amount1 = web3.utils.toWei('0.000001');

    // create tokens
    const Shishito = contract({
      abi: ShishitoMeta.abi,
      unlinked_binary: ShishitoMeta.bytecode,
    });
    Shishito.setProvider(web3.currentProvider);
    const shishito = await Shishito.at(SHISHITO_ADDRESS);

    console.log('Approving Shishito...');
    const receipt0 = await shishito.approve(ROUTER_ADDRESS, web3.utils.toWei('1'), {
      from: account
    });

    const Jalapeno = contract({
      abi: JalapenoMeta.abi,
      unlinked_binary: JalapenoMeta.bytecode,
    });
    Jalapeno.setProvider(web3.currentProvider);
    const jalapeno = await Jalapeno.at(JALAPENO_ADDRESS);

    console.log('Approving Jalapeno...');
    const receipt1 = await jalapeno.approve(ROUTER_ADDRESS, web3.utils.toWei('1'), {
      from: account
    });

    const shishitoBalance = await jalapeno.balanceOf(account, { from: account });
    const jalapenoBalance = await jalapeno.balanceOf(account, { from: account });
    console.log('shishito balance:', web3.utils.fromWei(shishitoBalance.toString()));
    console.log('jalapeno balance:', web3.utils.fromWei(jalapenoBalance.toString()));

    // create router
    console.log('Creating router...');
    const RouterContract = contract({
      abi: UniswapV2Router02.abi,
      unlinked_binary: UniswapV2Router02.bytecode,
    });
    RouterContract.setProvider(web3.currentProvider);
    const router = await RouterContract.at(ROUTER_ADDRESS);

    // create token-EDG pair
    const edgArgs = [
      jalapeno.address, // address of token
      web3.utils.toWei('0.001'), // amount of token
      web3.utils.toWei('0'),   // min amount of token
      web3.utils.toWei('0.001'), // amount of EDG
      account,
      Math.ceil(Date.now() / 1000) + (60 * 20), // deadline: 1 day
      {
        from: account,
        value: web3.utils.toWei('.001'),
      }
    ];
    console.log('Adding token/EDG liquidity...');
    const liquidityEDGReceipt = await router.addLiquidityETH(...edgArgs);
    console.log('Added token/EDG liquidity...');
    console.log(liquidityEDGReceipt);

    // create token-token pair
    const args = [
      shishito.address, jalapeno.address,
      amount0, amount1,
      "0", "0",
      account,
      Math.ceil(Date.now() / 1000) + (60 * 20), // 1 day
      // { from: account, gas: web3.utils.toWei('100') },
      { from: account },
    ];
    console.log('Adding liquidity...');
    const liquidityReceipt = await router.addLiquidity(...args);
    console.log('Added liquidity');

    // query the pair
    const FactoryContract = contract({
      abi: UniswapV2Factory.abi,
      unlinked_binary: UniswapV2Factory.bytecode,
    });
    FactoryContract.setProvider(web3.currentProvider);
    console.log('Querying factory for pair...');
    const factory = await FactoryContract.at(FACTORY_ADDRESS, { from: account });
    const pairAddress = await factory.getPair.call(shishito.address, jalapeno.address, {
      from: account,
    });
    const nPairs = await factory.allPairsLength.call({ from: account });

    // query the pair's reserves
    console.log(`Got pair: ${pairAddress} (${nPairs} total pairs).`);
    assert.notEqual(+nPairs, 0);
    assert.notEqual(+(pairAddress.slice(2)), 0);
    const PairContract = contract({
      abi: UniswapV2Pair.abi,
      unlinked_binary: UniswapV2Pair.bytecode,
    });
    PairContract.setProvider(web3.currentProvider);
    const pair = await PairContract.at(pairAddress);
    const result = await pair.getReserves.call({ from: account });
    console.log('Found token0 in LP pool:', web3.utils.fromWei(result[0].toString()));
    console.log('Found token1 in LP pool:', web3.utils.fromWei(result[1].toString()));
    console.log('Done!');
  });
});
