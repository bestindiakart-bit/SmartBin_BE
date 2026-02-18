import Joi from "joi";

export const createCustomerSchema = Joi.object({
  customerId: Joi.string().required(),
  companyName: Joi.string().required(),
  customerName: Joi.string().required(),
  customerType: Joi.string().required(),

  transitDays: Joi.number().min(0).required(),

  gstNumber: Joi.string()
    .pattern(/^[0-9A-Z]{15}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid GST format",
    }),

  adminEmail: Joi.string().email().required(),

  adminPassword: Joi.string().min(6).required(),

  shippingAddress1: Joi.string().required(),
  shippingAddress2: Joi.string().required(),
  billingAddress: Joi.string().required(),

  url: Joi.string().uri().required(),

  geoLocation: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
});
