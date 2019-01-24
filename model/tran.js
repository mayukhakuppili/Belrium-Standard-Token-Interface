module.exports = {
    name: 'trans',
    fields: [
      {
        name: 'fromaddress',
        type: 'String',
        length: 256
      },
      {
        name: 'toaddress',
        type: 'String',
        length: 255
      },
      {
        name: 'tokens',
        type: 'String',
        length: 255
      }
    ]
  }