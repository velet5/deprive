import { AnimationType } from '../../comp/anim/animation'

export class RivAnimation {
  constructor(
    readonly name: string,
    readonly loopType: AnimationType,
    readonly objects: RivAnimationObject[]
  ) {}
}

export class RivAnimationObject {
  constructor(
    readonly objectId: number,
    readonly properties: RivAnimationProperty[]
  ) {}
}

export class RivAnimationProperty {
  constructor(
    readonly property: RivAnimatableProperty,
    readonly frames: RivAnimationFrame[]
  ) {}
}

export interface RivAnimationFrame {}

export class RivAnimationDoubleFrame implements RivAnimationFrame {
  constructor(
    readonly frameNumber: number,
    readonly value: number,
    readonly interpolationType: RivInterpolationType
  ) {}
}

export enum RivInterpolationType {
  linear = 1,
}

export enum RivAnimatableProperty {
  rotation = 1,
}
