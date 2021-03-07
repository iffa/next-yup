import { NextApiRequest, NextApiResponse } from 'next';
import { SchemaOf, ValidationError } from 'yup';

async function validation(
  schema: SchemaOf<Record<string, any>>,
  data: Record<string, any> | null,
  cast: boolean
): Promise<{ result?: Record<string, any>; valid: boolean; errors: string[] }> {
  return schema
    .validate(data)
    .then(result => {
      if (cast) {
        return { result: schema.cast(data), valid: true, errors: [] };
      }
      return { result, valid: true, errors: [] };
    })
    .catch((err: ValidationError) => ({
      result: {},
      valid: false,
      errors: err.errors,
    }));
}

export type ValidationRequestFields = Pick<
  NextApiRequest,
  'body' | 'headers' | 'query'
>;

export type ValidationSchemas = {
  [K in keyof ValidationRequestFields]?: SchemaOf<Record<string, any>>;
};

export type ValidationResults = {
  [K in keyof ValidationRequestFields]?: Record<string, any>;
};

export type ValidationFunctionHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  data: ValidationResults
) => void | Promise<void>;

export type ValidationFunction = (
  schemas: ValidationSchemas,
  handler: ValidationFunctionHandler
) => ValidationFunctionHandler;

export default function withYup(cast = true): ValidationFunction {
  return (schemas, handler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const fields: (keyof ValidationRequestFields)[] = [
        'body',
        'headers',
        'query',
      ];

      let validationErrors: string[] = [];
      const data: ValidationResults = {};
      for await (const field of fields) {
        if (schemas[field]) {
          const { result, errors } = await validation(
            schemas[field]!,
            req[field],
            cast
          );
          data[field] = result;
          validationErrors = validationErrors.concat(errors);
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json(validationErrors);
      }

      console.log(data);

      return handler(req, res, data);
    };
  };
}
