export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      data: {
        errors: error.details.map((e) => e.message),
      },
    });
  }

  next();
};
