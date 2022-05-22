import { Deprive } from '../deprive'

export interface DepriveExporter {
  export(deprive: Deprive): Uint8Array
}
