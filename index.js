import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";

// Configurações da API:
const app = express();
app.use(express.json());
app.use(cors());

// Modelos Joi:
const userSchema = Joi.object({
  name: Joi.string().required(),
});

const messageSchema = Joi.object({
  to: Joi.string().required(),
  text: Joi.string().required(),
  type: Joi.string().required().valid("message", "private_message"),
});

// conexões com o Mongo:
const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db("DadosProjeto13");
});

// Metodos da API:

app.post("/participants", async (req, res) => {
  const user = req.body;

  try {
    // Verificar com joi:
    const validation = userSchema.validate(user, { abortEarly: false });

    if (validation.error) {
      const listaErros = validation.error.details.map((d) => d.message);
      return res.status(422).send(listaErros);
    }

    //verificar se existe no database:
    const userVerify = await db
      .collection("users")
      .findOne({ name: user.name });

    if (userVerify) return res.status(409).send("usuario já regitrado");

    //salvar no database:
    const newUser = {
      name: user.name,
      lastStatus: Date.now(),
    };

    const newMsg = {
      from: user.name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs(Date.now()).format("HH:mm:ss"),
    };

    db.collection("users").insertOne(newUser);
    db.collection("mensagens").insertOne(newMsg);
  } catch (error) {
    //Deu tudo errado:
    console.log(error);
  }
  //Deu tudo certo:
  res.sendStatus(201);
});

app.get("/participants", async (req, res) => {
  try {
    const listaUsers = await db.collection("users").find().toArray();
    return res.send(listaUsers);
  } catch (error) {
    console.log(error);
  }
});

app.post("/messages", async (req, res) => {
  try {
    const fromUser = req.headers.user;
    const messageInfo = req.body;

    // verificação do usuario:
    const userVerify = await db.collection("users").findOne({ name: fromUser });

    if (!userVerify) {
      return res.status(422).send("usuario não encontrado");
    }

    // validação da mensagem:
    const validation = messageSchema.validate(messageInfo, {
      abortEarly: false,
    });

    if (validation.error) {
      const listaErros = validation.error.details.map((d) => d.message);
      return res.status(422).send(listaErros);
    }

    const newMessage = {
      from: fromUser,
      ...messageInfo,
      time: dayjs(Date.now()).format("HH:mm:ss"),
    };

    db.collection("mensagens").insertOne(newMessage);
  } catch (error) {
    console.log(error);
  }

  res.sendStatus(201);
});

app.get("/messages?:limit", async (req, res) => {
  let limite;
  let listaMsg;
  const user = req.headers.user;
  let novaLista;

  try {
    listaMsg = await db.collection("mensagens").find().toArray();

    novaLista = listaMsg.filter((o) => o.to === user || o.type === "message");

    limite = req.query.limit;
  } catch (error) {
    console.log(error);
  }

  res.send(novaLista.slice(-limite).reverse());
});

app.post("/status", async (req, res) => {
  const user = req.headers.user;
  let listaParticipantes;
  try {
    const validaUser = await db.collection("users").findOne({ name: user });
    if (!validaUser) return res.sendStatus(404);
    await db
      .collection("users")
      .updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
  } catch (error) {
    console.log(error);
  }
  res.sendStatus(200);
});

setInterval(async () => {
  const now = Date.now();
  const listaUser = await db.collection("users").find().toArray();
  listaUser.map(async (obj) => {
    if (now - obj.lastStatus > 10000) {
      await db.collection("mensagens").insertOne({
        from: obj.name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: dayjs(Date.now()).format("HH:mm:ss"),
      });
      await db.collection("users").deleteOne({ name: obj.name });
    }
  });
}, 15000);

app.listen(5000);