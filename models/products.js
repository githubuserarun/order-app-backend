const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productsSchema = new Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
    productName:{ type: String, required: true },
    productQuantity:{ type: Number, required: true },
    productPrice:{ type: Number, required: true },
});

module.exports = mongoose.model("products", productsSchema);
