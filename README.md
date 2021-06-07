## Edgeware Frontier Tester

Unit tests for Edgeware Frontier.

You'll need to run a frontier-compatible [Edgeware node](https://github.com/hicommonwealth/edgeware-node). We are currently testing against the `erup-4` branch.

### Quickstart

Start the Edgeware node:

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

To run a specific test, provide the name of the test. For example:

```
yarn test web3tests/testLockdrop.js
```

Known issues:
- Contract nonce resets when deploying a new contract with value
  (https://github.com/paritytech/frontier/issues/286)

The following functionality is tested:
- [X] Adding Liquidity to a fresh Uniswap deployment
- [X] Generating an ERC20 Token Allowance
- [ ] Create Factory Contract
  - See the known issue above
- [X] Create2 Factory Contract
- [X] Calling a precompile (ECRecover)
- [X] Event emission and subscription
- [X] Fallback function
- [X] Hashing (on chain and with web3 provider): keccak256, sha3, ripemd
- [X] Contract Interfaces
- [X] Edgeware Lockdrop
- [X] Contract Owners
- [X] Transferring balance into EVM pallet
- [X] Timestamps
- [X] Contract creation with non-zero contract balance