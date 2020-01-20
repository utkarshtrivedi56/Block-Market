import { isTopic } from "web3-utils";
import { AssertionError } from "assert";
//var Web3 = require('web3');
//var web3 = new Web3(Web3.ganache);

const Marketplace = artifacts.require("./Marketplace.sol");

require('chai').use(require('chai-as-promised')).should();

contract('Marketplace',([deployer,seller,buyer])=>{
    let marketplace;

    before(async()=>{
        marketplace = await Marketplace.deployed();
    });
    describe('deployment',async()=>{

       it('deploys successfully',async()=>{
            const address = await marketplace.address;
            assert.notEqual(address, 0x0);
        })

        it('it has a name',async()=>{
            const name = await marketplace.name();
            //console.log(name);
            assert.equal(name,'utkarsh');
        })
    })

    describe('products',async()=>{

        let result,productCount;
        before(async()=>{
            result = await marketplace.createProduct('Realme X',web3.utils.toWei('1','ether'),{ from: seller});
            productCount = await marketplace.productCount();
        });
 
         it('creates products',async()=>{

            //success
             assert.equal(productCount,1);
             
             const event = result.logs[0].args;
             assert.equal(event.id.toNumber(),productCount.toNumber(),'id is correct');
             assert.equal(event.name,'Realme X' ,'is correct');
             assert.equal(event.price,'1000000000000000000' ,'is correct');
             assert.equal(event.owner,seller ,'is correct');
             assert.equal(event.purchased,false ,'is correct');
             //console.log(result.logs);

             //failure
             await marketplace.createProduct('',web3.utils.toWei('1','ether'),{ from: seller}).should.be.rejected;
             await marketplace.createProduct('Realme X',0,{ from: seller}).should.be.rejected;
             
         })

         it('lists products', async()=>{
             const product = await marketplace.products(productCount);
             assert.equal(product.id.toNumber(),productCount.toNumber(),'id is correct');
             assert.equal(product.name,'Realme X' ,'is correct');
             assert.equal(product.price,'1000000000000000000' ,'is correct');
             assert.equal(product.owner,seller ,'is correct');
             assert.equal(product.purchased,false ,'is correct');
         })

         it('sells products', async()=>{

            //track seller balance
            let oldbalance;
            oldbalance = await web3.eth.getBalance(seller);
            oldbalance = new web3.utils.BN(oldbalance);

            const result = await marketplace.purchaseProduct(productCount,{from: buyer, value: web3.utils.toWei('1','ether')});
            const event = result.logs[0].args;
             assert.equal(event.id.toNumber(),productCount.toNumber(),'id is correct');
             assert.equal(event.name,'Realme X' ,'is correct');
             assert.equal(event.price,'1000000000000000000' ,'is correct');
             assert.equal(event.owner,buyer ,'is correct');
             assert.equal(event.purchased,true ,'is correct');

             //check that seller has received the funds
             let newbalance;
             newbalance = await web3.eth.getBalance(seller);
             newbalance = new web3.utils.BN(newbalance);
            
             let price;
             price = web3.utils.toWei('1','ether');
             price = new web3.utils.BN(price);

             const expectedbalace = oldbalance.add(price);
             assert.equal(expectedbalace.toString(),newbalance.toString());

            await marketplace.purchaseProduct(99,{from: buyer, value: web3.utils.toWei('1','ether')}).should.be.rejected;
            await marketplace.purchaseProduct(productCount,{from: buyer, value: web3.utils.toWei('.5','ether')}).should.be.rejected;
            await marketplace.purchaseProduct(productCount,{from: deployer, value: web3.utils.toWei('1','ether')}).should.be.rejected;
            await marketplace.purchaseProduct(productCount,{from: buyer, value: web3.utils.toWei('1','ether')}).should.be.rejected;

        })
     })

})