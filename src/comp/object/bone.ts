import { CompId } from '../id'
import { DepriveObject } from './object'

export class BoneSystem {
  constructor(
    readonly primary: PrimaryBone,
    readonly secondaries: SecondaryBone[]
  ) {}
}

export interface Bone extends DepriveObject {
  readonly length: number
  readonly rotation: number
}

export class PrimaryBone implements Bone {
  constructor(
    readonly id: CompId,
    readonly x: number,
    readonly y: number,
    readonly length: number,
    readonly rotation: number
  ) {}
}

export class SecondaryBone implements Bone {
  constructor(
    readonly id: CompId,
    readonly parentId: CompId,
    readonly length: number,
    readonly rotation: number
  ) {}
}
