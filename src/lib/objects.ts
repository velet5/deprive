interface DepriveObject {
  id: number
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

export class Fill {
  color: Color
  opacity: number

  constructor(color: Color, opacity: number) {
    this.color = color
    this.opacity = opacity
  }

  static fromHex(hex: string, opacity?: number): Fill {
    return new Fill(Color.fromHex(hex), opacity || 1)
  }
}

export class ArtBoard implements DepriveObject {
  id: number

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

enum DepriveType {
  Artboard = 'Artboard',
}

type DepriveEntry = {
  id: number
  tpe: DepriveType
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
      tpe: DepriveType.Artboard,
      object: artboard,
    }

    return artboard
  }

  private nextId(): number {
    return this.id++
  }
}
