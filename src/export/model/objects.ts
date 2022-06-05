import { rivObjectMeta, RivObjectMeta } from './meta'

export interface RivObject {
  readonly meta: RivObjectMeta
}

export type RivExportedObject = {
  parentId: number
  object: RivObject
}

export class RivBlackBoard implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.blackBoard
}

export class RivArtboard implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.artboard

  constructor(readonly width: number, readonly height: number) {}
}

export class RivShape implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.shape

  constructor(readonly x: number, readonly y: number) {}
}

export class RivRectangle implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.rectangle

  constructor(readonly width: number, readonly height: number) {}
}

export class RivSolidColor implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.solidColor

  constructor(
    readonly r: number,
    readonly g: number,
    readonly b: number,
    readonly a: number
  ) {}
}

export class RivFill implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.fill

  constructor() {}
}

export class RivBone implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.bone

  constructor(
    readonly x: number,
    readonly y: number,
    readonly length: number,
    readonly rotation: number
  ) {}
}

export class RivBoneBase implements RivObject {
  readonly meta: RivObjectMeta = rivObjectMeta.boneBase

  constructor(readonly length: number, readonly rotation: number) {}
}
