import { DepriveEntity } from '../core'

export interface Animatable<A> extends DepriveEntity {
  animProperty: AnimatableProperty
}

export enum AnimatableProperty {
  X = 'X',
  Y = 'Y',
  Point = 'Point',
  Color = 'Color',
}
