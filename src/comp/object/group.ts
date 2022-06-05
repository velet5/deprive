import { CompId } from '../id'
import { DepriveObject } from './object'

export class Group implements DepriveObject {
  constructor(
    readonly id: CompId,
    readonly x: number,
    readonly y: number,
    readonly rotation: number
  ) {}
}
