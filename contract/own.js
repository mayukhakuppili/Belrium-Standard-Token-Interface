const Currency = 'IXO';

module.exports = {

    createBalTable:  function(superAdmin){
        app.sdb.create('bal' ,{address:superAdmin, balance:'0' ,currency:'IXO'});
    },
    createBalTable1:  function(){
        app.sdb.create('bal' ,{address:this.trs.senderId, balance:'0' ,currency:'IXO'});
    },


    balanceOf: async function(tokenOwner){
        var Currency='IXO';
        var b= await app.model.Bal.findOne({
                condition: {
                  address: tokenOwner,
                  currency: Currency
                 },
                 fields: ['balance']
               });
           if(!b){
               return "address not found";
           }
            return Number(b.balance);
    },

    transferFrom: async function(fromaddr, toaddr, x){ 
        var Currency='IXO';

           // console.log("From address: " + fromaddr + " To address: " + toaddr);
           
            var spender1 = await app.model.Approve.findOne({
                condition:{
                    owner: fromaddr
                },
                fields: ['spender']
            });
            console.log("spender address: " + JSON.stringify(spender1));
            var row =await app.model.Approve.findOne({
                condition:{
                    owner: fromaddr,
                    spender: spender1.spender
                },
                fields: ['amount']
            });
           // console.log("Got object: " + JSON.stringify(row));

            if(!row || x > Number(row.amount)){
               return "invalid approve";
            }
            else{
             var frombal= await app.model.Bal.findOne({
             condition: {
                address: fromaddr,
                currency: Currency
                  },
                fields: ['balance']
                });
                
                if(!frombal){
                    return "invalid Sender address!";
                 }
                app.sdb.update("bal",{balance:Number(frombal.balance) - x},{address: fromaddr});
 
                var tobal = await app.model.Bal.findOne({
                   condition: {
                     address: toaddr,
                     currency: Currency
                       },
                    fields: ['balance']
                     });
                     if(!tobal){
                        return "invalid receiver's address!";
                     }
              app.sdb.update("bal",{balance:Number(tobal.balance) - -x},{address: toaddr});    
              app.sdb.update("approve",{amount: Number(row.amount)-x},{owner: fromaddr, spender: spender1.spender});
              app.sdb.create('tran' ,{fromaddress:fromaddr, toaddress:toaddr ,tokens:x});
        
            }

    },
    
    transfer: async function(addr, amount){
        var Currency = 'IXO';
        var frombal= await app.model.Bal.findOne({
                condition: {
                  address: this.trs.senderId,
                  currency: Currency
                 },
                 fields: ['balance']
               });
               if(!frombal){
                   return "Sender address not found";
               }
            
            var tobal =  await app.model.Bal.findOne( {
                condition: {
                  address: addr,
                  currency: Currency
                 },
                 fields: ['balance']
               });
               if(!tobal){
                   return "Receiver address not found";
               }

               if(Number(frombal.balance) < amount){
                   return "Insufficient balance in senders address";
               }
    
        app.sdb.update("bal",{balance:Number(frombal.balance) - amount},{address: this.trs.senderId});
        app.sdb.update("bal",{balance:Number(tobal.balance) - -amount},{address: addr});

        app.sdb.create('tran' ,{fromaddress:this.trs.senderId, toaddress:addr ,tokens:amount});

        // return this.transferFrom(this.trs.senderID, address, amount);  // Called the transferFrom function for code reusability 
    },                                                                 // assuming that transaction fees won't incur when a contract is 
                                                                        // called from another function.
                                                                        // I think that transaction fees incur only when a contract is called
                                                                        // with /transactions/unsigned type: 1000 
                                                                        // Will change it if that's not how it works.
    approve: async function(spender1, amount1){
        
        var  row = await app.model.Approve.findOne({
            condition: {
              owner:this.trs.senderId,
              spender:spender1
             },
             fields: ['amount']
           });
        if(!row){
            app.sdb.create("approve", { 
                owner: this.trs.senderId,
                spender: spender1,
                amount: amount1
            });
            app.sdb.create("approval", { 
                owner: this.trs.senderId,
                spender: spender1,
                value: amount1
            });
        }else{
            app.sdb.update("approve",{amount: amount1},{owner: this.trs.senderId, spender: spender1});
            app.sdb.update("approval",{value: amount1},{owner: this.trs.senderId, spender: spender1});
        }
   },
    
    allowance: async function(owner, spender){
        var row = app.model.Approve.findOne({
            condition:{
                owner: owner,
                spender: spender
            },
            fields: ['amount']
        });
        return Number(row.amount);
    },

    spendAllowance: async function(owner1, amount1){
        function require(condition, error) {
            if (condition) throw Error(error)
          }
          var Currency = 'IXO';
         
            let opt = {
            condition:{
                owner: this.trs.senderId ,
                spender: owner1
            },
            fields: ['amount']
        }
         var bal = app.model.Approve.findOne(opt);
        require(bal === 0, 'Zero allowance')
        require(amount1 > bal, 'Amount is greater than allowance')
        
        app.sdb.update("approve",{amount: Number(bal.amount) - amount1},{owner:this.trs.senderId ,spender: owner1});

        let option1 = {
            condition: {
              address: owner1,
              currency: Currency
             },
             fields: ['balance']
           }
        var frombal =  await app.model.Bal.findOne(option1);
 
        app.sdb.update("bal",{balance: Number(frombal.balance) - amount1},{address: owner1});

        let option2 = {
            condition: {
              address: this.trs.senderId,
              currency: Currency
             },
             fields: ['balance']
           }
        var tobal =  await app.model.Bal.findOne(option2);
        app.sdb.update("bal",{balance: Number(tobal.balance) - -amount1},{address: this.trs.senderId});

        var res=app.balances.transfer(Currency, amount, owner1,this.trs.senderID );
        return res;
        
    },

    getTotalSupply: async function(){
        return app.model.Token.findOne({currency: CURRENCY}).totalSupply;
    },
    

    generateOneTimeDappAddress: function(superAdmin){
       // var AschJS = require('asch-js');
        //this function is designed in such a way where it can be executed absolutely once.

        var executed = false;              // ---> The closure variable
        return async function() {          // ---> The function that will actually be stored in generateOneTimeDappAddress
            if (!executed) {
                executed = true;

                var secret = Math.random().toString(36).substring(7);
                //var keys = AschJS.crypto.getKeys(secret);
                app.sdb.create("token",{
                    totalSupply: "10",
                    currency: "IXO",
                    tokenExchangeRate: "0.1",
                    dappAddress: "0xajsfjasfa2346",
                    //dappAddress: AschJS.crypto.getAddress(keys.publicKey),
                    //dappPubKey: keys.publicKey(),
                    dappPubKey: "123",
                    shortName: "ixo",
                    precision: 8,
                    dappOwner:superAdmin
                });
                
               // return secret;
            }else{
                return "Address already issued";
            }
   
        };
    }(),  //---> Called this function and it returns the return function which will be stored in generateOneTimeDappAddress
    // If using closures to achieve a singleton function doesn't work in blockchain sense, 
    // then the alternate idea is to write this function in init.js
    // assuming that init.js runs only one time when the Dapp is launched.

    // dAppAddress: async function(){
    //     return await app.model.Token.findOne({}).dappAddress;
    // },

    withdrawFromDAppAddress: async function(Currency,amount){
        //can include this so only owner of the DApp can withdraw funds in the DApp wallet.
        var Currency='IXO';
        function require(condition, error) {
            if (!condition) throw Error(error)
          }

        let row = await app.model.Token.findOne({fields:['dappOwner']});
        require(row !== this.trs.senderID, 'Only the owner can withdraw from DApp')                

         let option5= {
            condition: {
              address: row,
              currency: Currency
             },
             fields: ['balance']
           }
            var x= await app.model.Bal.findOne(option5);
            require(x<amount,'Insufficient balance in DApp wallet')
            app.sdb.update("bal", {balance: x-amount},{address:row});
       
    },

    mint: async function(toaddr, amount){
        var Currency='IXO';
        function require(condition, error) {
            if (!condition) throw Error(error)
          }

        var row = await app.model.Token.findOne({fields:['dappOwner']});
        console.log("Got object: " + JSON.stringify(row));
        require(row !== this.trs.senderId, 'Only the DApp owner can mint tokens')

       let option = {
        condition: {
          address: toaddr,
          currency: Currency
         },
         fields: ['balance']
       }
        var x= await app.model.Bal.findOne(option);
        require(x!== undefined, 'To address does not exist')
        app.sdb.update("bal",{balance: Number(x.balance) - -amount}, {address:toaddr});

    //     let option1 = {
    //         condition: {
    //           dappOwner: toaddr,
    //           currency: Currency
    //          },
    //          fields: ['totalSupply']
    //        }
    //     var tot= await app.model.Token.findOne(option1);
    //     console.log("total supply: " + JSON.stringify(tot)); 
    //     require(tot!== undefined, 'To address does not exist')
    //    app.sdb.update("token",{totalSupply: Number(tot.totalSupply) - -amount}, {dappOwner:toaddr});
       
    },

    burn: async function(amount){
        var Currency='IXO';
        function require(condition, error) {
            if (condition) throw Error(error)
          }
          let option = {
            condition: {
              address: this.trs.senderId,
              currency: Currency
             },
             fields: ['balance']
           }
        var x= await app.model.Bal.findOne(option); 
        require(Number(x.balance) < amount, 'Insufficient balance to burn')

        app.sdb.update("bal", {balance:Number(x.balance)-amount}, {address:this.trs.senderId});
        
    //     let option1 = {
    //         condition: {
    //           dappOwner: this.trs.senderID,
    //           currency: Currency
    //          },
    //          fields: ['totalSupply']
    //        }
    //     var total= await app.model.Token.findOne(option1); 
     
    //    app.sdb.update("token", {totalSupply:total - amount}, {dappOwner:this.trs.senderID});

    },

    burnFrom: async function(fromaddr, amount){
            var Currency='IXO';
            function require(condition, error) {
                if (condition) throw Error(error)
              }
              let option = {
                condition: {
                  address: fromaddr,
                  currency: Currency
                 },
                 fields: ['balance']
               }
            var x= await app.model.Bal.findOne(option); 
            require(x < amount, 'Insufficient balance to burn')
        //     let option1 = {
        //         condition: {
        //           dappOwner: fromaddr,
        //           currency: Currency
        //          },
        //          fields: ['totalSupply']
        //        }
        //     var totSup= await app.model.Token.findOne(option1); 
         
        // app.sdb.update("token", {totalSupply: totSup.totalSupply-amount}, {dappOwner:fromaddr});
        app.sdb.update("bal", {balance:x.balance-amount}, {address:fromaddr});

    }

}