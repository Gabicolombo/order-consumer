module.exports.consumeQueue = async (event) => {
  for(const order of events.Records){
    const message = JSON.parse(order.body);
    console.log(`Processing order: ${message}`);
  }
  return {
    status: 200;
  }
};
