const {Router} = require("express")
const Pizza = require("../models/Pizza")
const router = new Router()
const stripe = require("stripe")("sk_test_51LZFBNBCidn8pjEBOM8kiPAojYJv4aR6eUo5aDbc2qEoCk6ECiTooFr8nZvVKkFsp2Vbmndm1MaqzYpydcTx6tgy00drOP3hEX")
router.get("/", async(req,res)=> {
    try {
        const page =  parseInt(req.query.page)
        const limit =  parseInt(req.query.limit)
        const results = {}
        const searchProps = {}
        const sortProps = [req.query.sortProps, - 1]
        const {category, title} = req.query
        if(req.query.title.trim() !== "")
            searchProps.title = new RegExp(`${title.trim()}`, "i")
        if(req.query.category !== "0")
            searchProps.category = category
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        
        if(endIndex > await Pizza.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit
            }
        }
        if(startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit
            }
        }
        results.results = await Pizza.find(searchProps).sort([sortProps]).limit(limit).skip(startIndex).exec()
        results.numberOfPages = Math.ceil(await Pizza.find(searchProps).countDocuments().exec() / limit)
        res.json(results)
    } catch(err) {
        console.log(err)
        res.status(404).json({message:"Пиццы не найдены"})
    }
})

router.post("/checkout", async (req,res)=> {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            mode: "payment",
            line_items: req.body.map(item=> {
                return {
                    price_data: {
                        currency:"usd",
                        product_data: {
                            name: `${item.title} ${item.type} ${item.size} см` 
                        },
                        unit_amount: item.price * 100
                    },
                    quantity: item.count
                }
            }),
        
        success_url: `http://localhost:3000/cart`,
        cancel_url: `http://localhost:3000/`
        })
        res.json({url:session.url})
    } catch(err) {
        console.log(err)
    }   
})
module.exports = router