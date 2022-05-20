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
