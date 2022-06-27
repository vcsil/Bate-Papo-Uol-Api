import express from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send("Foi")
});

app.listen(process.env.PORTA_SERVIDOR, () => {
  console.log(chalk.blue(`\nServidor inicializado na porta ${process.env.PORTA_SERVIDOR}`))
})