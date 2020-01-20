pragma solidity ^0.5.0;

contract Marketplace{
    string public name;
    uint public productCount = 0;
    mapping(uint=> Product) public products;

    struct Product{
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = 'utkarsh';
    }

    function createProduct(string memory _name, uint _price) public {
        //second parameter in require statement is error...
        require(bytes(_name).length > 0,"statment is incorrect");  //require a valid product name
        require(_price > 0,"statment is incorrect"); //require a valid price
         //underscore denotes the local varialble
        productCount++;
        products[productCount] = Product(productCount,_name,_price, msg.sender,false);
        emit ProductCreated(productCount,_name,_price, msg.sender,false);
    }

    function purchaseProduct(uint _id) public payable{
        //fetch the product
        Product memory _product = products[_id];
        address payable _seller = _product.owner;
        require(_product.id>0 && _product.id<=productCount,"invalid product id");
        require(msg.value>=_product.price,"insufficient ether"); //check there is enough ether in the transaction
        require(!_product.purchased,"product is already purchased");
        require(_seller != msg.sender,"seller should not buy its own products");

        _product.owner = msg.sender;
        _product.purchased = true;
        products[_id] = _product;
        address(_seller).transfer(msg.value);

        emit ProductPurchased(productCount,_product.name,_product.price, msg.sender,true);
    }
}