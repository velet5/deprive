import { CompId } from '../id'

export class Artboard {
  constructor(
    readonly id: CompId,
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) {}
}
