const express = require("express");
const app = express();
const port = 3000;
const connet = require('./config/mongodb')
const tourRoute = require('./routes/tourRoute')
const RabbitMQ = require("./config/rabbitmq");
const bodyParser = require("body-parser");
//
// const mq = RabbitMQ.getInstance();
// mq.createExchange("tours", "fanout");
// mq.createQueue("tour_queue")
connet()
// middlewares
//https://stackoverflow.com/questions/51224668/axios-cross-domain-cookies
const cors = require("cors");
const allowedOrigins = [
  "localhost",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8082/",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // callback(new Error('Not allowed by CORS'))
      // console.log("------")
      // console.log("origin",origin)
      callback(null, true);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "200mb" }));
// route
app.use("/tours", tourRoute);
// Khởi động server
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

process.on("SIGINT", () => {
  console.log("Closing...");
  app.close(() => {
    closeConnection()
    console.log("Server đã đóng.");
    process.exit(0);
  });
});
