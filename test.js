const express=require ("express");
const cors = require("cors");
const mongoose = require('mongoose');
const User = require('./models/user');
const nodemailer = require('nodemailer');
const router = express.Ruter();
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb;//localhost:2823/myapp',{useNewUrlParser : true});

router.use(cors());
router.use(express.json());

router.post('/register',(req,res)=>{
    const {name,email,password,confirmPassword}=req.body;
    if(password !=confirmPassword){
        return res.status(400).json({error : 'Password do not match'});
    }

    User.create({name,email,password,verificationStatus:false},(err,user)=>{
        if(err){
            return res.status(500).json({error:err});
        }

        sendVerificationEmail(user.email);

        res.json({message: 'User crested successfully'});
    });
});

const sendVerificationEmail = (email) =>{
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: 'youremail@gmail.com',
            pass: 'yourpassword'
        }
    });

    let mailOptions ={
        from: 'youremail@gmail.com',
        to: email,
        subject : 'Email Verification',
        text: 'Click on the following link to verify your email : http://localhost:3000/verify?email='+email
    };

    transporter.sendMail(mailOptions, function(error,info){
        if(error)console.log(error);
        else console,log('email sent:'+info.response);
    });
}

router.get('/Verify',(req,res)=>{
    const {email} =req.query;

    User.findOne({email},(err,user) => {
        if(err){
            return res.status(500).json({error : err});
        }

        if(!user){
            return res.status(404).json({error: 'User not found'});
        }

        user.verificationStatus = true;
        user.save((err)=>{
            if(err){
                return res.status(500).json({error: err});
            }
            res.redirect('/login');
        });
    });
});

router.post('/login' , (req,res) => {
    const { email,password } = req.body;

    User.findOne({email},(err,user)=>{
        if(err){
            return res.status(500).json({error : err});
        }

        if(!user){
            return res.status(404).json({error : 'User not found'});
        }

        user.comparePassword(password,(err , isMatch)=>{
            if(err){
                return res.json({error:err});
            }

            if(!isMatch) return res;
        })
    })
});

router.put('/update',(req,res)=>{
    const{email,name}=req.body;
    User.findOne({email},(err,user)=>{
        if(err){
            return res.status(500),json({error:err});
        }

        if(!user){
            return res.status(404).json({error : 'User not found'});
        }

        user.name = name;
        user.save((err)=>{
            if(err){
                return res.status(500).json({error : err});
            }

            res.json({message : 'User updated successfully'});
        });
    });
});
