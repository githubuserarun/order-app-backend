const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const orders = require("./models/orders");
const products = require("./models/products");
const app = express();
require('dotenv').config();

const PORT = 5000;
const URL = process.env.URL

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
run();

app.post("/add-order", async (req, res) => {
  try {
    const { totalPrice, discount, discountPrice, productdata } = req.body;

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
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(200).json({ message: error._message, status: false });
  }
});

app.get("/orders", async (req, res) => {
    try {
      const ordersList = await orders.find();
  
      if (!ordersList || ordersList.length === 0) {
        return res
          .status(200)
          .json({ message: "No products found", status: false });
      } else {
        res.status(200).json({
          data: ordersList,
          message: "Received products successfully",
          status: true,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error", status: false });
    }
  });

  app.post("/view-details", async (req, res) => {
    const {id} = req.body;
    console.log(id)
    try {
      const findorder = await orders.find({_id:id})
      console.log(findorder)
      const productsList = await products.find({orderId:id});
  
      if (!productsList || productsList.length === 0) {
        return res
          .status(200)
          .json({ message: "No products found", status: false });
      } else {
        res.status(200).json({
          data: productsList,
          orderData:findorder[0],
          message: "Received products successfully",
          status: true,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error", status: false });
    }
  });


  app.delete('/del-order/:orderId', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      const order = await orders.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found', status: false });
      }
  
      await orders.findByIdAndDelete(orderId);
  
      await products.deleteMany({ orderId: orderId });
  
      res.status(200).json({ 
        message: 'Order deleted successfully', 
        status: true 
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ 
        message: 'Internal server error', 
        status: false, 
        error: error.message 
      });
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
