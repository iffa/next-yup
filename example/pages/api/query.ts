import withYup from 'next-yup';
import * as yup from 'yup';

export const catSchema = yup.object().shape({
  catName: yup.string().required(),
  isHungry: yup.boolean().required(),
});

export default withYup(true)({ query: catSchema }, (req, res, data) => {
  // validated data from query parameters, with attempted type cast to match schema
  const { query } = data;
  return res.json({ query });
});
