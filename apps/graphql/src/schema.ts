import { builder } from './builder'

import './schemas/Auth'
import './schemas/Version'
export const schema = builder.toSchema()
