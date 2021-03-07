# next-yup

> Simple validation for [Next.js](https://nextjs.org) API routes using [Yup](https://github.com/jquense/yup)

## Install

```bash
npm install next-yp
# or
yarn add next-yup
```

## Usage

Get started by creating a Yup object schema and wrapping your API route function with the `withYup` wrapper:

```typescript
import withYup from 'next-yup';
import * as yup from 'yup';

export const catSchema = yup.object().shape({
  catName: yup.string().required(),
  isHungry: yup.boolean().required(),
});

export default withYup()({ query: catSchema }, (req, res, data) => {
  // validated data from query parameters, with attempted type cast to match schema
  const { query } = data;
  return res.json({ query });
});

// GET http://localhost:3000/api/query?catName=bob&isHungry=true
// -> { "query": { "isHungry": true, "catName": "bob" } }
```
