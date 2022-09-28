const mongoose = require("mongoose")

const pizzaSchema = new mongoose.Schema({
    imageUrl: {
        type:String,
        required:true
    },
    title: {
        type:String,
        required:true
    },
    types: {
        type:Array,
        required:true
    },
    sizes: {
        type:Array,
        required:true
    },
    category: {
        type: Number,
        required:true
    },
    rating: {
        type: Number,
        required:true
    },
    price: {
        type:Number, 
        required:true,
        default: 0
    }
},
{
    timestamps:true
})

module.exports = mongoose.model("Pizza", pizzaSchema)