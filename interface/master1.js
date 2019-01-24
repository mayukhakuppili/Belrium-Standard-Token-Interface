//var AschJS = require('asch-js');

app.route.post('/user/bal', async function (req, cb) {
    var params = {
        owner: req.query.owner,
    };
    var response = await app.balances.get(params.owner);
    return response;
});

app.route.post('/user/bal1', async function (req, cb) {
    var params = {
        owner: req.query.owner,
    };
    let cond={
           mintAt: owner
    }
    var response = await app.model.Token.count(cond);
    return response;
});


app.route.post('/user/getTotSupply', async function (req, cb) {
    var params = {
        owner:req.query.owner
        // Currency: req.query.Currency,
    };
    let opt1 = {
        condition:{
            dappOwner:params.owner
            // currency:Currency
        },
        fields: ['totalSupply']
    }
        var res = app.model.Token.findOne(opt1);
        return {
            TotalSupply:res.totalSupply
        }
});

app.route.post('/user/getBal', async function (req, cb) {
    var params = {
        owner:req.query.owner
    };
    let opt = {
        condition:{
            address:params.owner
        },
        fields: ['balance']
    }
        var res = await app.model.Bal.findOne(opt);
        return {
            balance:res.balance
        }
});




