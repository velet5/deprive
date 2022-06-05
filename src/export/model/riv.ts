import { RivAnimation } from './animations'
import { RivExportedObject } from './objects'

export class Riv {
  constructor(
    readonly objects: RivExportedObject[],
    readonly animations: RivAnimation[]
  ) {}
}
