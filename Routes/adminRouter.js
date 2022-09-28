const {Router} = require("express")
const Pizza = require("../models/Pizza")
const Admin = require("../models/Admin")
const router = new Router()
const checkAuth = require("../utils/checkAuth")
const bcrypt = require("bcrypt")
const { validationResult } = require("express-validator")
const authValidation = require("../validations/auth")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, callback)=> {
        callback(null, "uploads")
    },
    filename: (req, file, callback)=> {
        req.imagePath = Math.random()
        callback(null, req.imagePath + file.originalname)
    }
})

const upload = multer({storage})


router.post("/login", authValidation, async(req,res)=> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.status(400).json({message: "Неверный e-mail или пароль"})
        const admin = await Admin.findOne({email: req.body.email})
        if(!admin)
            return res.status(400).json({message: "Такого пользователя не существует"})

        const isValidPass = await bcrypt.compare(req.body.password, admin.password)
        if(!isValidPass)
            return res.status(400).json({message: "Неверный пароль"})
        const token = jwt.sign({
            _id:admin._id
        },
        "secret",
        {expiresIn:"30d"})

        res.json({
            admin,
            token
        })
    }  catch(err) {
        console.log(err)
        res.status(500).json({message: "Серверная ошибка"})
    }
})
router.get("/auth/me", checkAuth, async(req,res)=> {
    const admin = await Admin.findById(req.userId)
    if(!admin)
        return res.status(404).json({message: "Пользователь не найден"})
    res.json(admin)
})
router.post("/create-pizza", checkAuth, upload.single("image"), async(req,res)=> {
    try {
        const newPizza = new Pizza({
            imageUrl: req.body.imageUrl,
            price: req.body.price,
            title: req.body.title,
            types: req.body.types,
            sizes: req.body.sizes,
            category: req.body.category,
            rating: req.body.rating,
        })
        await newPizza.save()
        res.json(newPizza)
    } catch(err) {
        console.log(err)
        res.status(500).json({message: "Ошибка создания новой пиццы"})
    }
})
router.post("/uploads",checkAuth, upload.single("image"), async(req,res)=> {
    try {
        res.json({
            url: `/preview/${req.imagePath + req.file.originalname}`
        })
    } catch(err) {
        console.log(err)
        res.status(500).json({message: "Не удалось загрузить фото"})
    }
    
})
router.delete("/remove/:id",checkAuth, async (req, res)=> {
    try {
        Pizza.findOneAndDelete({
            _id: req.params.id
        },
        (err,doc)=> {
            if(err)
                return res.status(500).json({message: "Не удалось удалить пиццу"})
            if(!doc)
                return res.status(404).json({message: "Пицца не найдена"})
        })
        res.json({success: true})
    } catch(err) {
        console.log(err)
        res.status(500).json({message: "Не удалось удалить пиццу"})
    }
})
router.get("/:id",checkAuth, async (req, res)=> {
    try {
    const pizza = await Pizza.findById(req.params.id)
        res.json(pizza)
    } catch(err) {
        console.log(err)
        res.status(404).json({message: "Пицца не найдена"})
    }

})
router.patch("/edit/:id",checkAuth, async (req, res)=> {
    try {
        if(!req.body.imageUrl)
            delete req.body.imageUrl
        const pizza = await Pizza.findOneAndUpdate(
        {_id: req.params.id},
        req.body,
        {returnDocument:"after"})
        res.json(pizza)
    } catch(err) {
        console.log(err)
        res.status(500).json({message: "Не удалось обновить пиццу"})
    }

})
module.exports = router