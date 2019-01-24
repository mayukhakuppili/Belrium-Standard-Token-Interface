module.exports = {
   
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
    },                            

    transferFrom: async function(fromaddr, toaddr, x){ 
        var Currency='IXO';
           
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
}