export enum DepriveObjectType {
  Artboard = 1,
}

export enum DeprivePropertyType {
  Fill = 1,
  Color,
  Opacity,
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

interface Animatable {}

export class DepriveNumber implements Animatable {
  value: number

  constructor(value: number) {
    this.value = value
  }
}

export class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export class Size {
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }
}

export class Origin {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export class Color {
  r: number
  g: number
  b: number

  constructor(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }

  static fromHex(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return new Color(r, g, b)
  }
}

export class Fill implements DepriveProperty {
  type: DeprivePropertyType = DeprivePropertyType.Fill

  parent: DepriveProperty | null = null
  object: DepriveObject | null = null

  id: number
  color: Color
  opacity: number

  static defaultColor: Color = Color.fromHex('#888888')
  static defaultOpacity = 1

  constructor(
    id: number,
    object: DepriveObject | null,
    color: Color,
    opacity: number
  ) {
    this.id = id
    this.object = object
    this.color = color
    this.opacity = opacity
  }
}

export class ArtBoard implements DepriveObject {
  id: number
  type: DepriveObjectType = DepriveObjectType.Artboard
  parent: DepriveObject | null = null

  name: string
  position: Point
  size: Size
  origin: Origin
  mainArtboard: boolean
  clip: boolean
  fills: Fill[]

  static defaultName = 'Artboard'
  static defaultPosition = new Point(0, 0)
  static defaultOrigin = new Origin(0, 0)

  constructor(
    id: number,
    name: string,
    position: Point,
    size: Size,
    origin: Origin,
    mainArtboard: boolean,
    clip: boolean,
    fills: Fill[]
  ) {
    this.id = id
    this.name = name
    this.position = position
    this.size = size
    this.origin = origin
    this.mainArtboard = mainArtboard
    this.clip = clip
    this.fills = fills
  }
}

export type ArtboardOptions = {
  name?: string
  position?: Point
  size: Size
  origin?: Origin
  mainArtboard?: boolean
  clip?: boolean
  fills?: Fill[]
}

export type FillOptions = {
  color?: Color
  opacity?: number
}

export type DepriveEntry = {
  id: number
  tpe: DepriveObjectType
  object: DepriveObject
}

export class Deprive {
  private id: number = 1

  private registry: { [key: number]: DepriveEntry } = {}

  constructor() {}

  artboard(options: ArtboardOptions): ArtBoard {
    const id = this.nextId()
    const name = options.name ?? ArtBoard.defaultName
    const position = options.position ?? ArtBoard.defaultPosition
    const size = options.size
    const origin = options.origin ?? ArtBoard.defaultOrigin
    const mainArtboard = options.mainArtboard ?? false
    const clip = options.clip ?? true
    const fills = options.fills ?? []

    const artboard = new ArtBoard(
      id,
      name,
      position,
      size,
      origin,
      mainArtboard,
      clip,
      fills
    )

    this.registry[id] = {
      id,
      tpe: DepriveObjectType.Artboard,
      object: artboard,
    }

    return artboard
  }

  fill(options: FillOptions): Fill {
    const id = this.nextId()
    const color = options.color ?? Fill.defaultColor
    const opacity = options.opacity ?? Fill.defaultOpacity

    const fill = new Fill(id, null, color, opacity)

    return fill
  }

  fillFromHex(hex: string): Fill {
    const color = Color.fromHex(hex)
    const fill = this.fill({ color })
    return fill
  }

  private nextId(): number {
    return this.id++
  }
}

export enum AnimationType {
  OneShot = 1,
  Loop,
  PingPong,
}

export class AnimationLine {
  property: DepriveProperty
  keys: AnimationKey[]

  constructor(property: DepriveProperty, keys: AnimationKey[]) {
    this.property = property
    this.keys = keys
  }
}

export class AnimationKey {
  frame: number
  value: any

  constructor(frame: number, value: any) {
    this.frame = frame
    this.value = value
  }
}

export class Animation {
  name: string
  type: AnimationType
  duration: number = 1000
  playbackSpeed: number = 1
  snapKeysNumber: number = 60
  lines: AnimationLine[]

  constructor(name: string, type: AnimationType, lines: AnimationLine[]) {
    this.name = name
    this.type = type
    this.lines = lines
  }
}
