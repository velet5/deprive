export class ArtBoard {
  name: string
  position: Point
  size: Size
  origin: Origin
  mainArtboard: boolean
  clip: boolean
  fills: Fill[]

  constructor(
    name: string,
    position: Point,
    size: Size,
    origin: Origin,
    mainArtboard: boolean,
    clip: boolean,
    fills: Fill[]
  ) {
    this.name = name
    this.position = position
    this.size = size
    this.origin = origin
    this.mainArtboard = mainArtboard
    this.clip = clip
    this.fills = fills
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
}

export class Fill {
  color: Color
  opacity: number

  constructor(color: Color, opacity: number) {
    this.color = color
    this.opacity = opacity
  }
}
