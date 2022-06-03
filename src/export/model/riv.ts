import { RivObject } from './objects'

export class Riv {
  constructor(readonly objects: { parentId: number; object: RivObject }[]) {}
}
