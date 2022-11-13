import express from "express";
import cors from "cors";
import { MongoClient , ObjectId} from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";

const app = express();
app.use(express.json());
app.use(cors());

const userSchema = Joi.object({
    name: Joi.string().required()
});

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("DadosProjeto13");
});

app.post("/participants",  ( async (req, res) => {

    const user = req.body;

    try{
        // Verificar com joi:
        const validation = userSchema.validate(user, {abortEarly:false});

        if(validation.error){
            const listaErros = validation.error.details.map(d => d.message);
            return res.status(422).send(listaErros);
        };

        //verificar se existe no database:
        const userVerify = await db.collection("users").findOne({name:user.name});

        if(userVerify) return res.status(409).send("usuario já regitrado");
        
        //salvar no database:
        const newUser = {
            name: user.name,
            lastStatus: Date.now()
        };

        const newMsg = {
            from: user.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs(Date.now()).format('HH:mm:ss')
        };
        
        db.collection("users").insertOne(newUser);
        db.collection("mensagens").inserOne(newMsg);


    } catch(error){
        //Deu tudo errado:
        console.log(error);
    }
    //Deu tudo certo:
    res.sendStatus(201);
}));





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




// const clienteMongo = new MongoClient("mongodb://localhost:27017");
// let db;

// clienteMongo.connect().then( () => {
//     db = clienteMongo.db("DadosProjeto13")
// });

// app.get("/usuarios", ((req, res) => {
//     db.collection("users").find().toArray().then(user => {
//         console.log(user)
//         res.send(user)
//     })
// }));

// app.post("/usuarios", ((req, res) => {
//     db.collection("users").insertOne({
//         nome:"creide",
//         idade:"33 aninhos"
//     });
//     res.send("OK")
// }));

app.listen(5000);


