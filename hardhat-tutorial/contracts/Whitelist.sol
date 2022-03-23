//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Whitelist{
    
    uint8 maxWhitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    mapping(address=>bool) public whitelistedAddresses; //bool is by default false
    //Mapping has better timecomplexity than 'Arrays'

    constructor (uint8 _maxWhitelistedAddresses){

                maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public {
        require(!whitelistedAddresses[msg.sender],"Sender already in the whitelist");
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Max Limit Reached");
        whitelistedAddresses[msg.sender] = true;
        numAddressesWhitelisted += 1;
    }
}