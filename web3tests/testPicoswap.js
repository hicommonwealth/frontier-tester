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
const UniswapV2Factory = require('../node_modules/@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Pair = require('../node_modules/@uniswap/v2-core/build/UniswapV2Pair.json');

describe('Add Liquidity Test', () => {
  let WEDG9_ADDRESS = '0x79EaFd0B5eC8D3f945E6BB2817ed90b046c0d0Af';
  let MULTICALL_ADDRESS = '0x73b647cbA2FE75Ba05B8e12ef8F8D6327D6367bF';
  let SERRANO_ADDRESS = '0x59AF421cB35fc23aB6C8ee42743e6176040031f4';
  let JALAPENO_ADDRESS = '0x4fb87c52Bb6D194f78cd4896E3e574028fedBAB9';
  let HABANERO_ADDRESS = '0xEd8d61f42dC1E56aE992D333A4992C3796b22A74';
  let SHISHITO_ADDRESS = '0x47eb28D8139A188C5686EedE1E9D8EDE3Afdd543';
  let POBLANO_ADDRESS = '0x52d2878492EF30d625fc54EC52c4dB7f010d471e';

  let FACTORY_ADDRESS = '0x986885C706f3480205C381AEC6D8A13294806C9E';
  let ROUTER_ADDRESS = '0x9ccDE3aEB0b245a032b50f1C3352770143Df22F2';

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
    const liquidityEDGReceipt = await router.addLiquidityEDG(...edgArgs);
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
