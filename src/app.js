import { ObjectId } from 'mongodb';
import express from 'express';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import chalk from 'chalk';
import cors from 'cors';
import joi from 'joi';

import { concectarServidor, desconcectarServidor } from './server.js';
import { participanteSchema } from './validationJoi.js';

// Chamando as funções pq só funcionou depois que abriu e fechou a primeira vez
concectarServidor();
desconcectarServidor();

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/participants', async (req, res) => {
  const { name } = req.body;
  const corpoParticipante = {
    name,
    lastStatus: Date.now()
  };

  const validacao = participanteSchema.validate(corpoParticipante);
  if (validacao.error) {
    res.status(422).send(validacao.error.details[0].message);
    return
  }

  try {
    let db = await concectarServidor();
    if (db) {
      const nomeRepetido = await db.collection('participante').findOne({ name: name });
      if (nomeRepetido) {
        res.sendStatus(409);
        desconcectarServidor();
        return
      }

      await db.collection('participante').insertOne(corpoParticipante);
      await db.collection('mensagem').insertOne({
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs(corpoParticipante.lastStatus).format('HH:mm:ss')
      })

      res.sendStatus(201)
      desconcectarServidor();
      return
    }

    res.status(502).send("Servidor não conectou");
    desconcectarServidor();

  } catch (err) {
    desconcectarServidor();
    console.error(err);
    res.sendStatus(500);
  }

});

app.get('/participants', async (req, res) => {
  try {
    let db = await concectarServidor();
    if (db) {
      const participante = await db.collection('participante').find().toArray();
      res.status(200).send(participante)
      desconcectarServidor();
      return
    }

    res.status(502).send("Servidor não conectou");
    desconcectarServidor();

  } catch (err) {
    desconcectarServidor();
    console.error(err);
    res.sendStatus(500);
  }

});

app.post('/messages', async (req, res) => {
  const { to, text, type } = req.body;
  const from = req.headers.user;
  const corpoMensagem = {
    from,
    to,
    text,
    type,
    time: dayjs(Date.now()).format('HH:mm:ss')
  };

  try {
    let db = await concectarServidor();
    if (db) {
      const participantes = await db.collection('participante').find({}, {name:1, _id:0}).toArray();
      const participantesNomeLista = participantes.map(i => {return i.name});
      
      const mensagemSchema = joi.object({
        from: joi.string().valid(...participantesNomeLista).required(),
        to: joi.string().invalid("").required(),
        text: joi.string().invalid("").required(),
        type: joi.string().valid("message", "private_message").required(),
        time: joi.string().required()
      })

      const validacao = mensagemSchema.validate(corpoMensagem);
      if (validacao.error) {
        res.status(422).send(validacao.error.details[0].message);
        desconcectarServidor();
        return
      }

      await db.collection('mensagem').insertOne(corpoMensagem)

      res.sendStatus(201)
      desconcectarServidor();
      return
    }

    res.status(502).send("Servidor não conectou");
    desconcectarServidor();
  } catch (err) {
    desconcectarServidor();
    console.error(err);
    res.sendStatus(500);
  }

});

app.get('/messages', async (req, res) => {
  const usuario = req.headers.user;
  const quantidadeMensagem = Number(req.query.limit);

  try {
    let db = await concectarServidor();
    if (db) {
      const mensagens = await db.collection('mensagem').find().toArray();
      let filtro = mensagens.filter(i => {
        return i.to === 'Todos' || i.to === usuario
      })

      if (quantidadeMensagem) {
        filtro = filtro.slice(filtro.length - quantidadeMensagem, filtro.length);
        res.status(200).send(filtro)
        desconcectarServidor();
        return
      }
      res.status(200).send(filtro)
      desconcectarServidor();
      return
    }

    res.status(502).send("Servidor não conectou");
    desconcectarServidor();

  } catch (err) {
    desconcectarServidor();
    console.error(err);
    res.sendStatus(500);
  }

});

app.post('/status', async (req, res) => {
  const usuario = req.headers.user;

  try {
    let db = await concectarServidor();
    if (db) {
      const usuarioExiste = await db.collection('participante').findOne( { name: usuario } );
      if (!usuarioExiste) {
        res.sendStatus(404);
        desconcectarServidor();
        return
      };
      
      await db.collection('participante').updateOne({
        name: usuario
      }, {
        $set: {lastStatus: Date.now()}
      })

      res.sendStatus(200);
      desconcectarServidor();
      return 
    }
    
    res.status(502).send("Servidor não conectou");
    desconcectarServidor();

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    desconcectarServidor();
  }

})

app.delete('/messages/:ID_DA_MENSAGEM', async (req, res) => {
  const user = req.headers.user;
  const ID_DA_MENSAGEM = req.params.ID_DA_MENSAGEM;

  console.log(user, ID_DA_MENSAGEM)

  try {
    let db = await concectarServidor();
    if (db) {
      const mensagemExiste = await db.collection('mensagem').findOne( { _id: new ObjectId(ID_DA_MENSAGEM) } );

      if (!mensagemExiste) {
        res.sendStatus(404);
        desconcectarServidor();
        return
      }

      if (user === mensagemExiste.from && mensagemExiste.type !== 'status') {
        await db.collection('mensagem').deleteOne( { _id: new ObjectId(ID_DA_MENSAGEM)} );
        res.sendStatus(200)
        desconcectarServidor();
        return
      }

      res.sendStatus(401);
      desconcectarServidor();
      return
    }

    res.status(502).send("Servidor não conectou");
    desconcectarServidor();

  } catch (err ) {
    console.error(err);
    res.sendStatus(500);
    desconcectarServidor();
  }

})

// setInterval(async () => {
//   const horaAtualizada = Date.now();
//   // console.log(chalk.cyan('Iniciando'))
//   try {
//     let db = await concectarServidor();
//     if (db) {
//       const participantes = await db.collection('participante').find().toArray();
//       let participantesOff = participantes.filter( i => {
//         return horaAtualizada - i.lastStatus > 10000;
//       });

//       participantesOff.forEach(async (obj) => {
//         // console.log(horaAtualizada - obj.lastStatus)
//         await db.collection('participante').deleteOne( { name: obj.name } );
//         await db.collection('mensagem').insertOne({
//           from: obj.name,
//           to: 'Todos',
//           text: 'sai da sala...',
//           type: 'status',
//           time: dayjs(Date.now()).format('HH:mm:ss')
//         })
//       });
//       return
//     };
//   } catch (err) {
//     console.error(err);
//     console.log(500);
//     desconcectarServidor();
//   }


// }, process.env.TEMPO_REMOCAO);

app.listen(process.env.PORTA_SERVIDOR, () => {
  console.log(chalk.blue(`\nServidor inicializado na porta ${process.env.PORTA_SERVIDOR}`))
})