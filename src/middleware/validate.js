/**
 * Middleware factory for request validation using Zod schemas.
 * Supports either:
 * 1. Full request schema: z.object({ body?: ..., query?: ..., params?: ... })
 * 2. Direct body schema: z.object({ email: ..., password: ... })
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return async (req, _res, next) => {
    try {
      const isRequestShape =
        schema &&
        schema.shape &&
        (schema.shape.body !== undefined ||
          schema.shape.query !== undefined ||
          schema.shape.params !== undefined);

      if (isRequestShape) {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        req.valid = parsed;

        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) {
          Object.defineProperty(req, 'query', {
            value: parsed.query,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
        if (parsed.params !== undefined) req.params = parsed.params;
      } else {
        const parsedBody = await schema.parseAsync(req.body);
        req.body = parsedBody;
        req.valid = { body: parsedBody };
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { validate };
