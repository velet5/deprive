export enum DepriveObjectType {
  Artboard = 'Artboard',
  Fill = 'Fill',
  SolidColor = 'SolidColor',
  Rectangle = 'Rectangle',
  Ellipse = 'Ellipse',
}

export enum DeprivePropertyType {
  Fill = 1,
  Color,
}

export enum DepriveEntityType {
  Artboard = 1,
  Color,
  Fill,
}

export interface DepriveEntity {
  id: number
  parent: DepriveEntity | null
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
