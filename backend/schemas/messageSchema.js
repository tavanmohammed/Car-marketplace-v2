import Joi from "joi";

export const messageSchema = Joi.object({
  receiver_id: Joi.number().integer().required(),
  listing_id: Joi.number().integer().optional(),
  message_text: Joi.string().min(1).max(1000).required(),
});
