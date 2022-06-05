import { CompId } from '../id'

export enum AnimatableProperty {
  Rotation = 'rotation',
  X = 'x',
}

export enum AnimationType {
  oneShot = 'oneShot',
  loop = 'loop',
  pingPong = 'pingPong',
}

export type AnimationFrame<A> = {
  frameNumber: number
  value: A
}

export class Animation {
  constructor(
    readonly name: string,
    readonly type: AnimationType,
    readonly lines: AnimationLine<any>[]
  ) {}
}

export class AnimationLine<A> {
  constructor(
    readonly objectId: CompId,
    readonly property: AnimatableProperty,
    readonly frames: AnimationFrame<A>[]
  ) {}
}
