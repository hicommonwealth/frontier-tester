pragma solidity ^0.5.0;

contract ValueContract {
  uint valueStored;
  constructor() public payable {
    valueStored = msg.value;
  }
}
