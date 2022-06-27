import express from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import cors from 'cors';

// import { participanteSchema, mensagemSchema } from './validadtionJoi.js';
import { concectarServidor, desconcectarServidor } from './server.js';

concectarServidor();
desconcectarServidor();

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  
  try {
    let db = await concectarServidor();

    if (db) {
      const participante = await db.collection('participante').find().toArray();
      res.status(200).send(participante);
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