import joi from 'joi';

const participanteSchema = joi.object({
  name: joi.string().required(),
  lastStatus: joi.number().required()
});

const mensagemSchema = joi.object({
  from: joi.string().required(),
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().required(),
  time: joi.string().required()
})

export default { participanteSchema, mensagemSchema };