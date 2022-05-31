import { DepriveEntity } from '../core'

//@ts-ignore
export interface Animatable<A> extends DepriveEntity {
  animProperty: AnimatableProperty
}

export enum AnimatableProperty {
  X = 'X',
  Y = 'Y',
  Point = 'Point',
  Color = 'Color',
}

export enum FramValueType {
  Double = 'double',
}
