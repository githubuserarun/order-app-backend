const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const orders = require("./models/orders");
const products = require("./models/products");
const app = express();
require("dotenv").config();

const PORT = 5000;
const URL = process.env.URL;

app.use(cors());
app.use(express.json());

const run = async () => {
  try {
    await mongoose.connect(URL);
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.log(err);
  }
};

app.post("/add-order", async (req, res) => {
  try {
    const { totalPrice, discount, discountPrice, productdata } = req.body;
    await run();

    const newOrder = new orders({
      totalPrice,
      discount,
      discountPrice,
    });

    const savedOrder = await newOrder.save();

    const productPromises = productdata.map((product) => {
      return new products({
        orderId: savedOrder._id,
        productName: product.productName,
        productQuantity: product.quantity,
        productPrice: product.price,
      }).save();
    });

    await Promise.all(productPromises);

    res.status(200).json({
      message: "Order and products created successfully",
      orderId: savedOrder._id,
      status: true,
    });
    await mongoose.connection.close();
    console.log("Connection closed.");
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(200).json({ message: error._message, status: false });
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
});

app.get("/orders", async (req, res) => {
  try {
    await run();
    const ordersList = await orders.find();

    if (!ordersList || ordersList.length === 0) {
       res
        .status(200)
        .json({ message: "No products found", status: false });
      await mongoose.connection.close();
      console.log("Connection closed.");
      return;
    } else {
      res.status(200).json({
        data: ordersList,
        message: "Received products successfully",
        status: true,
      });
      await mongoose.connection.close();
      console.log("Connection closed.");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error", status: false });
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
});

app.post("/view-details", async (req, res) => {
  const { id } = req.body;
  console.log(id);
  try {
    await run();
    const findorder = await orders.find({ _id: id });
    console.log(findorder);
    const productsList = await products.find({ orderId: id });

    if (!productsList || productsList.length === 0) {
       res
        .status(200)
        .json({ message: "No products found", status: false });
      await mongoose.connection.close();
      console.log("Connection closed.");
      return;
    } else {
      res.status(200).json({
        data: productsList,
        orderData: findorder[0],
        message: "Received products successfully",
        status: true,
      });
      await mongoose.connection.close();
      console.log("Connection closed.");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error", status: false });
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
});

app.delete("/del-order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    await run();
    const order = await orders.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found", status: false });
      await mongoose.connection.close();
      console.log("Connection closed.");
      return;
    }

    await orders.findByIdAndDelete(orderId);

    await products.deleteMany({ orderId: orderId });

    res.status(200).json({
      message: "Order deleted successfully",
      status: true,
    });
    await mongoose.connection.close();
    console.log("Connection closed.");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
