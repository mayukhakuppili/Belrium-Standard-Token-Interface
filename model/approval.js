module.exports = {
    name: 'approvals',
    fields: [
      {
        name: 'owner',
        type: 'String',
        length: 256
      },
      {
        name: 'spender',
        type: 'String',
        length: 255
      },
      {
        name: 'value',
        type: 'String',
        length: 255
      }
    ]
  }