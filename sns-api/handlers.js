'use strict';

const hello = async (event) => {
  console.log('event :: ', event)
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Hello Roollu!',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports = {
  hello
}
