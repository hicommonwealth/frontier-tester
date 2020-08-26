pragma solidity ^0.5.0;

contract ValueContract {
  uint valueStored;
  constructor() public payable {
    valueStored = 0;
  }

  function sendValue() public payable {
    valueStored = valueStored + msg.value;
  }

  function getValue() public view returns (uint) {
    return valueStored;
  }
}
