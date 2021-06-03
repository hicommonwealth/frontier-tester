## Edgeware Frontier Tester

Unit tests for Edgeware Frontier.

You'll need to run a frontier-compatible [Edgeware node](https://github.com/hicommonwealth/edgeware-node).

Start the Edgeware node with the following command:

```
./target/release/edgeware --dev
```

To run all included frontier tests, use the following:

```
yarn all-tests
```

To run only the Uniswap add liquidity test, use the following:

```
yarn add-liquidity
```

To run a specific test:

```
ts-mocha --timeout 100000 --exit web3tests/[testName]
```

The following functionality is tested:
- Adding Liquidity to a fresh Uniswap deployment
- Generating an ERC20 Token Allowance
- Create Factory Contract
- Create2 Factory Contract
- Calling a precompile (ECRecover)
- Event emission and subscription
- Fallback function
- Hashing (on chain and with web3 provider): keccak256, sha3, ripemd
- Contract Interfaces
- Edgeware Lockdrop
- Modifiers
- Transferring balance into EVM pallet
- Timestamps
- Contract creation with non-zero contract balance