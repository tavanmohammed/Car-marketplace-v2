import Joi from "joi";

export function validateBody(schema) {
  // Checks incoming request data (req.body)
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    // If the data is wrong, return a 400 Bad Request with validation errors
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    // If the data is good → puts cleaned data inside req.validatedBody
    req.validatedBody = value;

    // Allow route to continue
    next();
  };
}
