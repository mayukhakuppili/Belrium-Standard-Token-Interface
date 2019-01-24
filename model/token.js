module.exports = {
    name: "tokens",
    fields: [
        {  
            name: 'totalSupply',
            type: 'String', 
            length: 255,
        },
        {
            name: 'currency',
            type: 'String',
            length: 255,
            not_null: true,
            primary_key:true
        },
        {
            name: 'tokenExchangeRate',
            type: 'String',
            length: 255,
        },
        {
            name: 'dappAddress',
            type: 'String',
            length: 255,
        },
        {
            name: 'dappPubKey',
            type: 'String',
            length: 255,
        },
        {
            name: 'shortName',
            type: 'String',
            length: 255,
        },
        {
            name: 'precision',
            type: 'String',
            length: 255,
        },
        {
            name: 'dappOwner',
            type: 'String',
            length: 255,
            // not_null: true,
            // primary_key:true
        }
   ]
}
