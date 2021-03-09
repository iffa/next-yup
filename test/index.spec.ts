import { testApiHandler } from 'next-test-api-route-handler';
import * as yup from 'yup';
import withYup from '../src';

describe('withYup', () => {
  const schema = yup.object().shape({
    name: yup.string().required(),
    isAlive: yup.boolean().required(),
  });

  describe('validate query params', () => {
    const handler = withYup()({ query: schema }, (_, res, data) => {
      return res.status(200).json({ ...data });
    });

    it('passes validation and casts properly', async () => {
      await testApiHandler({
        handler,
        requestPatcher: (req) =>
          (req.url = '/api/query?name=John Doe&isAlive=true'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toEqual(200);
          expect((await res.json()).query).toHaveProperty('isAlive', true);
        },
      });
    });

    it('returns HTTP 400 for invalid data', async () => {
      await testApiHandler({
        handler,
        requestPatcher: (req) => (req.url = '/api/query?invalid=goat'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toEqual(400);
        },
      });
    });
  });

  describe('validate headers', () => {
    const handler = withYup()({ headers: schema }, (_, res, data) => {
      return res.status(200).json({ ...data });
    });

    it('passes validation for headers and casts properly', async () => {
      await testApiHandler({
        handler,
        requestPatcher: (req) =>
          (req.headers = { name: 'John Doe', isAlive: 'true' }),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toEqual(200);
          expect((await res.json()).headers).toHaveProperty('isAlive', true);
        },
      });
    });

    it('returns HTTP 400 for invalid data', async () => {
      await testApiHandler({
        handler,
        requestPatcher: (req) => (req.headers = { invalid: 'goat' }),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toEqual(400);
        },
      });
    });
  });

  describe('request body', () => {
    const handler = withYup()({ body: schema }, (_, res, data) => {
      return res.status(200).json({ ...data });
    });

    it('passes validation for request body and casts properly', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              name: 'John Doe',
              isAlive: true,
            }),
          });
          expect(res.status).toEqual(200);
          expect((await res.json()).body).toHaveProperty('isAlive', true);
        },
      });
    });

    it('returns HTTP 400 for invalid data', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              invalid: 'goat',
            }),
          });
          expect(res.status).toEqual(400);
        },
      });
    });
  });
});
