import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { BaseSchema, ValidationError } from 'yup';

export type ValidationRequestFields = Pick<
  NextApiRequest,
  'body' | 'headers' | 'query'
>;

export type ValidationSchemas = {
  [K in keyof ValidationRequestFields]?: BaseSchema;
};

export type ValidationResults = {
  [K in keyof ValidationRequestFields]?: Record<string, any>;
};

type ValidationFunctionHandler<T = any> = NextApiHandler extends (
  ...a: any[]
) => infer R
  ? (...a: [...U: Parameters<NextApiHandler<T>>, data: ValidationResults]) => R
  : never;

export type ValidationFunction = (
  /**
   * Schemas to validate
   */
  schemas: ValidationSchemas,
  /**
   * Request handler that is called if validation succeeds
   */
  handler: ValidationFunctionHandler
) => NextApiHandler<any>;

async function validation(
  schema: BaseSchema,
  data: Record<string, any> | null,
  cast: boolean
): Promise<{ result?: Record<string, any>; valid: boolean; errors: string[] }> {
  return schema
    .validate(data)
    .then((result) => {
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

/**
 * Wrap your Next.js API route with this function to utilize Yup validation for
 * request body, query and headers.
 * @param cast If true, "data" object returned will have cast values
 * @returns {ValidationFunction}
 */
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

      return handler(req, res, data);
    };
  };
}
