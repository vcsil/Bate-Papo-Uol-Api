import joi from 'joi';

export const participanteSchema = joi.object({
  name: joi.string().invalid("").required(),
  lastStatus: joi.number().integer().required()
});