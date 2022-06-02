import { Artboard } from './object/artboard'

export class Project {
  constructor(
    readonly artboards: Artboard[],
    readonly animations: Animation[]
  ) {}
}
