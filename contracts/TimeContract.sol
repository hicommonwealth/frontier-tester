pragma solidity ^0.5.0;

contract TimeContract {
  uint timeCreated;

  constructor() public {
    timeCreated = now;
  }

  function viewTimeCreated() public view returns (uint) {
    return timeCreated;
  }

  function viewNow() public view returns (uint) {
    return now;
  }

  function viewBlockTimestamp() public view returns (uint) {
    return block.timestamp;
  }
}
