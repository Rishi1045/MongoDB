const bcrypt = require("bcrypt");   
const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET = "";
const { z } = require("zod");

mongoose.connect("");


const app = express();
app.use(express.json());

app.post("/signup", async function(req,res){

// ZOD    

    // step-1 => defining a schema
    const requiredBody = z.object({

        email: z.string().min(3).max(100).email(),
        name: z.string().min(3).max(100),
        password: z.string().min(3).max(100)

    })

    /*

    req.body
        email: string,
        password: string,
        name: string

    */

    // step-2 => parsing the data
    //const parsedData = requiredBody.parse(req.body);
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    if(!parsedDataWithSuccess.success){
        res.json({
            message: "Incorrect format",
            error: parsedDataWithSuccess.error
        })
    }

    //input validation
    const email = req.body.email; // string, @
    const password = req.body.password; // string -> 10 chars, 1 upper, 1 lower
    const name = req.body.name; // string

    // if(!email.isString() || !email.contains("@")){
    //     res.json({
    //         message: "incorrect email"
    //     })
    // }

    const hashedPassword = await bcrypt.hash(password, 5);
    console.log(hashedPassword);

    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    })

    res.json({
        message: "You are signed in"
    })
});


app.post("/signin", async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email 
    });

    if(!response){
        res.status(403).json({
            message: "user does not exist in our database"
        })
        return
    }

    const passwordMatch = await     bcrypt.compare(password, response.password);

    console.log(user);

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id.toString()
        },JWT_SECRET);
        res.json({
            token: token
        }); 
    }else{
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }
});


app.post("/todo", function(req,res){
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    TodoModel.create({
        title,
        userId,
        done
    })

    res.json({
        message: "todo created"
    })
});


app.get("/todos", async function(req,res){
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId: userId  
    })
    res.json({
        todos
    })


});

function auth(req,res,next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token,JWT_SECRET);

    if(decodedData){
        req.userId = decodedData.id;
        next();
    } else{
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
}

app.listen(3000);
