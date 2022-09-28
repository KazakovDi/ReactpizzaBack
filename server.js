const express = require("express")
const mongoose = require("mongoose")
const mainRouter = require("./Routes/mainRoute")
const adminRouter = require("./Routes/adminRouter")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())


app.use("/", mainRouter)
app.use("/admin", adminRouter)
app.use("/preview", express.static("uploads"))
const start = async ()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://user:user@cluster0.gjm6c.mongodb.net/pizzaApp?retryWrites=true&w=majority")
        app.listen(process.env.PORT || 5000, ()=> {
            console.log("Сервер запущен")
        })
    } catch(err) {
        console.log(err)
    }
}
start()