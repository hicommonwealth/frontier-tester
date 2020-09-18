const contract = require("@truffle/contract");
const { assert } = require("chai");
const { account, initWeb3 } = require('../utils');

const ERC20 = require('../build/contracts/ERC20.json');
const UniswapV2Router02 = require('../node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json');
const UniswapV2Factory = require('../node_modules/@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Pair = require('../node_modules/@uniswap/v2-core/build/UniswapV2Pair.json');

describe('Add Liquidity Test', () => {
   it('should create uniswap pair', async () => {
      const FACTORY_ADDRESS = '0xF8cef78E923919054037a1D03662bBD884fF4edf';
      const ROUTER_ADDRESS = '0x50275d3F95E0F2FCb2cAb2Ec7A231aE188d7319d';
   
      const address0 = '0x92496871560a01551E1B4fD04540D7A519D5C19e';
      const address1 = '0x63A1519eE99d1121780FFfa1726Ed2eCc6d1611B';
      const web3 = initWeb3();
      const amount0 = web3.utils.toWei('100');
      const amount1 = web3.utils.toWei('100');
   
      const ERC20Contract = contract({
         abi: ERC20.abi,
         unlinked_binary: ERC20.bytecode,
      });
      ERC20Contract.setProvider(web3.currentProvider);
      console.log('Fetching token contracts...');
      const token0 = await ERC20Contract.at(address0);
      const token1 = await ERC20Contract.at(address1);
      console.log('Approving token 0...');
      const receipt0 = await token0.approve(ROUTER_ADDRESS, amount0, {
         from: account, gasLimit: 10000000, gasPrice: 1000000000
      });
      console.log('Approving token 1...');
      const receipt1 = await token1.approve(ROUTER_ADDRESS, amount1, {
         from: account, gasLimit: 10000000, gasPrice: 1000000000
      });
   
      // create the pair
      const RouterContract = contract({
         abi: UniswapV2Router02.abi,
         unlinked_binary: UniswapV2Router02.bytecode,
      });
      RouterContract.setProvider(web3.currentProvider);
      const router = await RouterContract.at(ROUTER_ADDRESS);
      const args = [
         address0, address1,
         amount0, amount1,
         "0", "0",
         account,
         Math.ceil(Date.now() / 1000) + (60 * 20), // 1 day
         { from: account, gasLimit: 10000000, gasPrice: 1500000000 },
      ];
      console.log('Adding liquidity with args: ', args);
      const liquidityReceipt = await router.addLiquidity(...args);
      
      // query the pair
      const FactoryContract = contract({
         abi: UniswapV2Factory.abi,
         unlinked_binary: UniswapV2Factory.bytecode,
      });
      FactoryContract.setProvider(web3.currentProvider);
      console.log('Querying factory for pair...');
      const factory = await FactoryContract.at(FACTORY_ADDRESS);
      const pairAddress = await factory.getPair.call(address0, address1, {
         from: account, gasPrice: 1500000000,
      });
      const nPairs = await factory.allPairsLength.call({ from: account });
   
      // query the pair's reserves
      assert.notEqual(+nPairs, 0);
      assert.notEqual(+(pairAddress.slice(2)), 0);
      console.log(`Got pair: ${pairAddress} (${nPairs} total pairs).`);
      const PairContract = contract({
         abi: UniswapV2Pair.abi,
         unlinked_binary: UniswapV2Pair.bytecode,
      });
      PairContract.setProvider(web3.currentProvider);
      const pair = await PairContract.at(pairAddress);
      const result = await pair.getReserves.call({ from: account });
      console.log(result);
      assert.equal(result[0].toString(), amount0);
      assert.equal(result[1].toString(), amount1);
   });
});
