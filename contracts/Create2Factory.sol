pragma solidity ^0.5.0;

contract Create2Factory {
  address addr;

  constructor() public { }

  function deploy(bytes memory code, uint256 salt) public {
    address addrLocal;
    assembly {
      addrLocal := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(addrLocal)) {
        revert(0, 0)
      }
    }
    addr = addrLocal;
  }

  function viewAddr() public view returns (address) {
    return addr;
  }
}
