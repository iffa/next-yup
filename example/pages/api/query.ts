import withYup from '@lib';
import * as yup from 'yup';

export type CatDto = {
  catName: string;
  isHungry: boolean;
};

export const catSchema: yup.SchemaOf<CatDto> = yup.object().shape({
  catName: yup.string().required(),
  isHungry: yup.boolean().required(),
});

/**
 * http://localhost:3000/api/hello?catName=bob&isHungry=true
 */
export default withYup(true)({ query: catSchema }, (req, res, data) => {
  return res.json({ query: data.query });
});
