import joi from 'joi';

export const participanteSchema = joi.object({
  name: joi.string().invalid("").required(),
  lastStatus: joi.number().integer().required()
});

export const mensagemSchema = joi.object({
  from: joi.string().required(),
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().required(),
  time: joi.string().required()
})