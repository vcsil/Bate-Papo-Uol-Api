import express from 'express';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import chalk from 'chalk';
import cors from 'cors';

import { participanteSchema } from './validationJoi.js';
import { concectarServidor, desconcectarServidor } from './server.js';

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
    res.status(422).send(validacao.error.details[0].message)
    return
  }

  try {
    let db = await concectarServidor();
    if (db) {
      const participante = await db.collection('participante').find().toArray();
      const nomeRepetido = participante.find( usuario => usuario.name === name);
      if (nomeRepetido) {
        res.sendStatus(409)
        return
      }

      await db.collection('participante').insertOne(corpoParticipante);
      await db.collection('mensagem').insertOne({
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs(corpoParticipante.lastStatus).format('HH:MM:SS')
      })

      res.sendStatus(201)
      return
    }

    res.status(502).send("Servidor não conectou");

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
      return
    }

    res.status(502).send("Servidor não conectou");

  } catch (err) {
    desconcectarServidor();
    console.error(err);
    res.sendStatus(500);
  }

});

app.listen(process.env.PORTA_SERVIDOR, () => {
  console.log(chalk.blue(`\nServidor inicializado na porta ${process.env.PORTA_SERVIDOR}`))
})