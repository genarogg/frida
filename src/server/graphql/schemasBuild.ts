import { buildSchema } from 'graphql';

import schemas from './schemas';

import enums from './enums';

const schema = buildSchema(`
  ${enums},
  ${schemas}
`);

export default schema;