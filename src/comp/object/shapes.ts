import { CompId } from '../id'
import { Fill } from './fill'
import { DepriveObject } from './object'

export interface Shape extends DepriveObject {
  readonly id: CompId
  readonly x: number
  readonly y: number
}

export class Rectangle implements Shape {
  constructor(
    readonly id: CompId,
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number,
    readonly cornerRadius: number,
    readonly fills: Fill[] = []
  ) {}

  fill(fill: Fill): Rectangle {
    this.fills.push(fill)
    return this
  }
}

export class Ellipse implements Shape {
  constructor(
    readonly id: CompId,
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number,
    readonly fills: Fill[] = []
  ) {}

  fill(fill: Fill): Ellipse {
    this.fills.push(fill)
    return this
  }
}
