const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const url = `mongodb+srv://${process.env.user}:${process.env.password}@ecommerce.20uwu.mongodb.net/`;

const client = new MongoClient(url);

const database = client.db('test');
const orders = database.collection('orders');
const products = database.collection('products');

module.exports.consumeQueue = async (event) => {

  try {

    for (const order of event.Records) {

      const message = JSON.parse(order.body);
      console.log(`Processing order: ${JSON.stringify(message)}`);
      const { userId, items } = message;
      console.log(items);
      if (!Array.isArray(items)) {
        throw new Error('Invalid items format: expected an array');
      }
      console.log(userId);
      for (let item of items) {
        await products.updateOne(
          { _id: new ObjectId(item.productId) }, 
          { $inc: { quantity: -item.quantity } }
        )
        .then(result => console.log(`Updated Product: ${result.modifiedCount}`))
        .catch(err => console.error(err));
      }
      await orders.updateOne({ userId: userId }, {
        $set: {
          status: 'completed'
        }
      }).then(result => console.log(`Updated the status: ${result.modifiedCount}`)).catch(err => console.error(err));

    }
    return {
      status: 200
    };
  } catch (err) {
    console.error(err);
    await orders.updateOne({ _userId: userId }, {
      $set: {
        status: 'failed'
      }
    }).then(result => console.log(result)).catch(err => console.error(err));
    return {
      status: 500
    };
  }
};