## Frontier Tester

Unit tests for Edgeware Frontier. To run all the tests, use the following:

```
yarn test web3tests
```

To run a specific test:

```
yarn test web3tests/[testName]
```

The following are tested
-- Adding Liquidity to a fresh Uniswap deployment
-- Generating an ERC20 Token Allowance
-- Create Factory Contract 
-- Create2 Factory Contract 
-- Calling a precompile (ECRecover)
-- Event emission and subscription
-- Fallback function
-- Hashing (on chain and with web3 provider): keccak256, sha3, ripemd
-- Contract Interfaces
-- Edgeware Lockdrop
-- Modifiers
-- Transferring balance into EVM pallet
-- Timestamps
-- Contract creation with non-zero contract balance