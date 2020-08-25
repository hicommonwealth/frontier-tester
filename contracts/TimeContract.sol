pragma solidity ^0.5.0;

contract TimeContract {
  uint timeCreated;
  uint timeToTest;
  constructor() public {
    timeCreated = now;
    timeToTest = timeCreated + 10;
  }

  function isTestable() public view returns (bool) {
    if (now < timeToTest) {
      return false;
    } else {
      return true;
    }
  }

  function isBlockTestable() public view returns (bool) {
    if (block.timestamp < timeToTest) {
      return false;
    } else {
      return true;
    }
  }
}
