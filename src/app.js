import express from 'express';
import chalk from 'chalk';
import cors from 'cors';

let PORTA_SERVIDOR = 5000;

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send("Foi")
});

app.listen(PORTA_SERVIDOR, () => {
  console.log(chalk.blue(`\nServidor inicializado na porta ${PORTA_SERVIDOR}`))
})