const amqp = require("amqplib/callback_api");
const { v4: uuidv4 } = require("uuid");

class RabbitMQ {
  instance = null;
  constructor() {}
  static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQ();
    }
    return this.instance;
  }
  createExchange(name, mode) {
    amqp.connect("amqp://localhost", (err0, connection) => {
      if (err0) console.log(err0);
      else
        connection.createChannel((err1, channel) => {
          if (err1) console.log(err1);
          else channel.assertExchange(name, mode);
        });
      setTimeout(() => {
        connection.close();
      }, 500);
    });
  }
  createQueue(name) {
    amqp.connect("amqp://localhost", (err0, connection) => {
      if (err0) console.log(err0);
      else
        connection.createChannel((err1, channel) => {
          if (err1) console.log(err1);
          else channel.assertQueue(name, { durable: false });
        });
      setTimeout(() => {
        connection.close();
      }, 500);
    });
  }
  send(queue, msg) {
    amqp.connect("amqp://localhost", (err0, connection) => {
      if (err0) console.log(err0);
      else
        connection.createChannel((err1, channel) => {
          if (err1) console.log(err1);
          else {
            channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
            console.log(" [x] send %s", msg);
          }
        });
      setTimeout(() => {
        connection.close();
      }, 500);
    });
  }
  callRpc(msg) {
    return new Promise((resolve, reject) => {
      amqp.connect("amqp://localhost", (err0, connection) => {
        if (err0) {
          reject(err0);
          return;
        }
        connection.createChannel((err1, channel) => {
          if (err1) {
            reject(err1);
            return;
          }
  
          const queue = "rpc_queue";
          channel.assertQueue("", { exclusive: true }, (err2, replyQueue) => {
            if (err2) {
              reject(err2);
              return;
            }
  
            channel.consume(
              replyQueue.queue,
              (msg) => {
                if (msg.properties.correlationId == correlationId) {
                  const RPCResponse = msg.content.toString();
                  setTimeout(() => {
                    connection.close();
                  }, 500);
                  resolve(RPCResponse);
                }
              },
              { noAck: true }
            );
  
            const correlationId = uuidv4();
            channel.sendToQueue(queue, Buffer.from(msg), {
              correlationId,
              replyTo: replyQueue.queue,
            });
            console.log(`Sending RPC request ${correlationId}`);
          });
        });
      });
    });
  }
}
module.exports = RabbitMQ;
