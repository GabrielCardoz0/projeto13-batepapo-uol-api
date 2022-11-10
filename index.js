import express from "express";
import cors from "cors";
import { Collection, MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());



// const mongoClient = new MongoClient("mongodb://localhost:27017");

// let db;

// mongoClient.connect().then(() => {
//     db = mongoClient.db("test");
// });

// db.collection("test").find().toArray().then(res => console.log(res))



// app.post("participants", ((req, res) => {
//     const { name } = req.body;

//     //validacoes aqui:
//     if(!name || name === ""){
//         res.sendStatus(422);
//         return;
//     };
//     //validações acima.


//     const newUser = {
//         name:name, lastStatus: Date.now()
//     };

//     const newMsg = {
//         from:name, to:"Todos", text:"entra na sala...", type:"status", time:"HH:MM:SS"
//     };

//     res.sendStatus(201);

// }))

// app.get("participants", ((req, res) => {
//     res.send(listaParticipantes);
// }));

// app.post("messages", (req, res) => {
//     const {to, text, type} = req.body;
    
//     //validações aqui:

//     //
    
//     res.send(201);
// });

// app.get("messages", ((req, res) => {
//     res.send(listaMsg);
// }));

// app.post("status", ((req, res) => {
//     //validação
//     //

//     res.sendStatus(200)
// }))

const clienteMongo = new MongoClient("mongodb://localhost:27017");
let db;

clienteMongo.connect().then( () => {
    db = clienteMongo.db("MeuBanco")
});

app.get("/usuarios", ((req, res) => {
    db.collection("MeuBanco").find().toArray().then(user => {
        console.log(user)
        res.send(user)
    })
}));

app.post("/usuarios", ((req, res) => {
    db.collection("MeuBanco").insertOne({
        nome:"creide",
        idade:"35 aninhos"
    });
    res.send("OK")
}));

app.listen(5000);

