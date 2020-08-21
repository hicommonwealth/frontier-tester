const Web3 = require('web3');

// libraries
const Multicall = require('./build/contracts/Multicall.json');
const WETH9 = require('@uniswap/v2-periphery/build/WETH9.json');
const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');

// tokens
const TokenA = require('./build/contracts/TokenA.json');
const TokenB = require('./build/contracts/TokenB.json');

// Initialization
const privKey =
   '99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342'; // Genesis private key
const address = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
// const web3 = new Web3('https://rinkeby.infura.io/v3/b19b8175e688448ead43a0ab5f03438a');
const web3 = new Web3('http://localhost:9933');

// Deploy contract
const deployContract = async (name, c, args = []) => {
   console.log(`Attempting to deploy ${name} from account: ${address}`);

   const contract = new web3.eth.Contract(c.abi);

   const contractTx = contract.deploy({
      data: c.bytecode,
      arguments: args,
   });

   const data = contractTx.encodeABI();
   const createTransaction = await web3.eth.accounts.signTransaction(
      {
         from: address,
         data,
         gasLimit: 8000000,
         gasPrice: 1000000000,
      },
      privKey
   );

   const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
   );
   console.log(`${name} deployed at address ${createReceipt.contractAddress}`);
   return createReceipt.contractAddress;
};

const deploy = async () => {
   const multicallAddress = await deployContract("Multicall", Multicall);
   const factoryAddress = await deployContract("UniswapV2Factory", UniswapV2Factory, [ address ]);
   const WETH9Address = await deployContract("WETH9", WETH9);
   const routerAddress = await deployContract(
     "UniswapV2Router02",
     UniswapV2Router02,
     [ factoryAddress, WETH9Address ],
   );
   const tokenAAddress = await deployContract("TokenA", TokenA, [ "8000000000000000000000000" ]);
   const tokenBAddress = await deployContract("TokenB", TokenB, [ "8000000000000000000000000" ]);
};

deploy();
