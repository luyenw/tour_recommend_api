const { json } = require("body-parser");
const RabbitMQ = require("../config/rabbitmq");
const Tour = require("../schemas/Tour");

var controller = {};

controller.getNewTours = async (req, res) => {
  try {
    const searchstring = "Hà Nội";
    var tours = await Tour.find({ description: { $regex: searchstring } })
      .limit(12)
      .lean();
    tours = tours.map((x) => {
      delete x["tour_des"];
      delete x["related_urls"];
      return x;
    });
  } catch (err) {
    return res.status(404).json([]);
  }
  return res.status(200).json(tours);
};
controller.getTourById = async (req, res) => {
  const tour_id = req.params.id;
  var tour = null;
  try {
    tour = await Tour.findOne({ _id: tour_id }).lean();
    delete tour["related_urls"];
  } catch (err) {
    return res.status(400);
  }
  var related_ids = await RabbitMQ.getInstance().callRpc(tour_id);
  related_ids = related_ids.substring(1, related_ids.length - 1).split(",");
  related_ids = related_ids.map((x) => {
    x = x.trim();
    x = x.substring(1, x.length - 1);
    return x;
  });
  console.log(related_ids);
  var related_items = [];
  related_items = await Promise.all(
    related_ids.map(async (id) => {
      if (id.length == 0) return null;
      var item = await Tour.findOne({ _id: id }).lean();
      const { tour_des, related_urls, ...tour } = item;
      return tour;
    })
  );
  tour["related_items"] = related_items;
  return res.status(200).json(tour);
};

module.exports = controller;
