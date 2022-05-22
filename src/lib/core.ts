export enum DepriveObjectType {
  Artboard = 1,
}

export enum DeprivePropertyType {
  Fill = 1,
  Color,
  Opacity,
}

export enum DepriveEntityType {
  Artboard = 1,
  Color,
  Fill,
}

export interface DepriveEntity {
  id: number
}

export interface DepriveObject extends DepriveEntity {
  id: number
  type: DepriveObjectType
  parent: DepriveObject | null
}

export interface DepriveProperty extends DepriveEntity {
  id: number
  type: DeprivePropertyType
  parent: DepriveProperty | null
  object: DepriveObject | null
}

export interface IdGenerator {
  nextId(): number
}
