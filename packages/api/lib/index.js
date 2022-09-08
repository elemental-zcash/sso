const { db } = require('./pg');

const main = async () => {
  try {
    console.log(await db.any("SELECT 'Hello, World!'"));

    // success;
    console.log('Success!');
  } catch (error) {
    console.log('ERROR:', error);
  }
};

main();
