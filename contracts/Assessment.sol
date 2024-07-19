// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract MysteryBoxSubscription {
    address payable public owner;

    enum SubscriptionSize { Small, Medium, Large, ExtraLarge }
    struct Subscriber {
        string name;
        SubscriptionSize subscriptionSize;
    }

    mapping(address => Subscriber) public subscribers;
    event Subscribed(address subscriber, string name, SubscriptionSize subscriptionSize);
    
    constructor() {
        owner = payable(msg.sender);
    }

    function subscribe(string memory _name, SubscriptionSize _subscriptionSize) public payable {
        require(bytes(_name).length > 0, "Name is required");
        
        uint256 subscriptionCost;
        if (_subscriptionSize == SubscriptionSize.Small) {
            subscriptionCost = 0.01 ether;
        } else if (_subscriptionSize == SubscriptionSize.Medium) {
            subscriptionCost = 0.03 ether;
        } else if (_subscriptionSize == SubscriptionSize.Large) {
            subscriptionCost = 0.05 ether;
        } else if (_subscriptionSize == SubscriptionSize.ExtraLarge) {
            subscriptionCost = 1 ether;
        }
        
        require(msg.value >= subscriptionCost, "Insufficient payment");

        subscribers[msg.sender] = Subscriber(_name, _subscriptionSize);

        emit Subscribed(msg.sender, _name, _subscriptionSize);
    }

    function getSubscription(address _subscriber) public view returns (string memory name, SubscriptionSize subscriptionSize) {
        Subscriber storage subscriber = subscribers[_subscriber];
        return (subscriber.name, subscriber.subscriptionSize);
    }
}
