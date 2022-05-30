export class RivTreeVisualizer {
  private position: number = 0

  constructor(private array: Uint8Array) {}

  public parse(): RivParsingResult {
    let objects = []
    try {
      const header = this.parseHeader()

      while (this.position < this.array.length) {
        objects.push(this.parseObject())
      }

      return new RivParsingResult(header, objects)
    } catch (e) {
      console.log(objects)
      throw new Error(`Error parsing RIV file: ${e}`)
    }
  }

  private parseProperty(valueType: RivValueType): RivProperty | null {
    const code = this.array[this.position++]

    if (code === 0) return null
    if (code === undefined) return null

    let type: RivPropertyType
    let value: RivValue
    switch (code) {
      case 0x04:
        type = RivPropertyType.Name
        value = this.parseString()
        break

      case 0x05:
        type = RivPropertyType.Parent
        value = this.readId()
        break

      case 0x07:
        type = RivPropertyType.ArtboardWidth
        value = this.parseFloat()
        break

      case 0x08:
        type = RivPropertyType.ArtboardHeight
        value = this.parseFloat()
        break

      case 0x0d:
        type = RivPropertyType.ShapeX
        value = this.parseFloat()
        break

      case 0x0e:
        type = RivPropertyType.ShapeY
        value = this.parseFloat()
        break

      case 0x14:
        type = RivPropertyType.ShapeWidth
        value = this.parseFloat()
        break

      case 0x15:
        type = RivPropertyType.ShapeHeight
        value = this.parseFloat()
        break

      case 0x25:
        type = RivPropertyType.ColorValue
        value = this.parseColor()
        break

      case 0x33:
        type = RivPropertyType.KeyedObjectId
        value = this.readId()
        break

      case 0x35:
        type = RivPropertyType.KeyedPropertyCode
        value = this.readProperty()
        break

      case 0x37:
        type = RivPropertyType.AnimationName
        value = this.parseString()
        break

      case 0x3b:
        type = RivPropertyType.LoopType
        value = this.parseEnum('loopType')
        break

      case 0x43:
        type = RivPropertyType.KeyFrameNumber
        value = this.parseUnsignedVarInt()
        break

      case 0x44:
        type = RivPropertyType.InterpolationType
        value = this.parseEnum('interpolationType')
        break

      case 0x46:
        type = RivPropertyType.FrameValue
        value = this.readValue(valueType)
        break

      default:
        type = RivPropertyType.Unknown
        value = new RivNumber(0)
        break
    }

    return new RivProperty(code, type, value)
  }

  private parseByte(): RivValue {
    const byte = this.array[this.position++]
    return new RivNumber(byte)
  }

  private readValue(valueType: RivValueType): RivValue {
    switch (valueType) {
      case RivValueType.Float:
        return this.parseFloat()
        break

      default:
        throw new Error(`Unsupported value type ${valueType}`)
    }
  }

  private readProperty(): RivPropertyValue {
    const byte = this.array[this.position++]
    return new RivPropertyValue(byte)
  }

  private parseEnum(name: string): RivEnum {
    const value = this.array[this.position++]
    return new RivEnum(name, value)
  }

  private parseColor(): RivColor {
    const r = this.array[this.position++]
    const g = this.array[this.position++]
    const b = this.array[this.position++]
    const a = this.array[this.position++]

    return new RivColor(r, g, b, a)
  }

  private parseFloat(): RivValue {
    const a = this.array[this.position++]
    const b = this.array[this.position++]
    const c = this.array[this.position++]
    const d = this.array[this.position++]

    const buf = new ArrayBuffer(4)
    const view = new DataView(buf)
    view.setInt8(0, a)
    view.setInt8(1, b)
    view.setInt8(2, c)
    view.setInt8(3, d)

    const v = view.getFloat32(0, true)

    return new RivFloat(v)
  }

  private readId(): RivId {
    const id = this.parseUnsignedVarInt()
    return new RivId(id)
  }

  private parseObject(): RivObject {
    const code = this.array[this.position++]

    let type: RivObjectType
    let valueType: RivValueType = RivValueType.Float
    switch (code) {
      case 0x17:
        type = RivObjectType.Blackboard
        break
      case 0x01:
        type = RivObjectType.Artboard
        break

      case 0x03:
        type = RivObjectType.Shape
        break

      case 0x04:
        type = RivObjectType.Ellipse
        break

      case 0x12:
        type = RivObjectType.SolidColor
        break

      case 0x14:
        type = RivObjectType.Fill
        break

      case 0x19:
        type = RivObjectType.KeyedObject
        break

      case 0x1a:
        type = RivObjectType.KeyedProperty
        break

      case 0x1e:
        type = RivObjectType.KeyFrameDouble
        valueType = RivValueType.Float
        break

      case 0x1f:
        type = RivObjectType.LinearAnimation
        break

      default:
        type = RivObjectType.Unknown
        break
    }

    let properties: RivProperty[] = []

    while (true) {
      const p = this.parseProperty(valueType)

      if (p == null) {
        break
      }

      properties.push(p)
    }

    return new RivObject(code, type, properties)
  }

  private readZero(): void {
    const position = this.position++
    const value = this.array[position]
    if (value !== 0) {
      throw new Error(
        `Expected 0, got ${value.toString(16)} at position ${position}`
      )
    }
  }

  private parseHeader(): RiveHeader {
    const fingerprint = this.parseStringValue(4)
    const major = this.array[this.position++]
    const minor = this.array[this.position++]
    const fileId = this.parseUnsignedVarInt()

    let propertyKeys = []

    while (true) {
      const propertyKey = this.parseUnsignedVarInt()
      if (propertyKey === 0) {
        break
      }

      propertyKeys.push(propertyKey)
    }

    // int currentInt = 0;
    // int currentBit = 8;
    // for (auto propertyKey : propertyKeys) {
    //     if (currentBit == 8) {
    //         currentInt = reader.readUint32();
    //         currentBit = 0;
    //     }
    //     int fieldIndex = (currentInt >> currentBit) & 3;
    //     header.m_PropertyToFieldIndex[propertyKey] = fieldIndex;
    //     currentBit += 2;
    //     if (reader.didOverflow()) {
    //         return false;
    //     }
    // }

    let int = 0
    let bit = 8

    for (let i = 0; i < propertyKeys.length; i++) {
      if (bit === 8) {
        int = this.parseUint32()
        bit = 0
      }
    }

    return new RiveHeader(fingerprint, major, minor, fileId)
  }

  private peek(): number {
    return this.array[this.position]
  }

  private parseUint32(): number {
    const a = this.array[this.position++]
    const b = this.array[this.position++]
    const c = this.array[this.position++]
    const d = this.array[this.position++]

    const buf = new ArrayBuffer(4)
    const view = new DataView(buf)
    view.setInt8(0, a)
    view.setInt8(1, b)
    view.setInt8(2, c)
    view.setInt8(3, d)

    const v = view.getUint32(0, true)

    return v
  }

  private parseUnsignedVarInt(): number {
    let result = 0
    let shift = 0
    let byte: number
    do {
      byte = this.array[this.position++]
      result |= (byte & 0x7f) << shift
      shift += 7
    } while (byte & 0x80)
    return result
  }

  private parseString(): RivString {
    const len = this.array[this.position++]
    const value = this.parseStringValue(len)

    return new RivString(value)
  }

  private parseStringValue(len: number): string {
    let result = ''

    for (let i = 0; i < len; i++) {
      result += String.fromCharCode(this.array[this.position++])
    }

    return result
  }
}

export class RivParsingResult {
  constructor(public header: RiveHeader, public objects: RivObject[]) {}
}

export class RivObject {
  constructor(
    public code: number,
    public type: RivObjectType,
    public properties: RivProperty[]
  ) {}
}

export class RivProperty {
  constructor(
    public code: number,
    public type: RivPropertyType,
    public value: RivValue
  ) {}
}

export class RiveHeader {
  public constructor(
    public fingerprint: string,
    public major: number,
    public minor: number,
    public fileId: number
  ) {}
}

export interface RivValue {}

export class RivPropertyValue implements RivValue {
  public constructor(public value: number) {}

  public toString(): string {
    return this.value.toString(16).padStart(2, '0')
  }
}

export class RivFloat implements RivValue {
  constructor(public value: number) {}

  public toString(): string {
    return `${this.value.toFixed(2)}`
  }
}

export class RivNumber implements RivValue {
  constructor(public value: number) {}

  public toString(): string {
    return `${this.value}`
  }
}

export class RivString implements RivValue {
  constructor(public value: string) {}

  public toString(): string {
    return `"${this.value}"`
  }
}

export class RivEnum implements RivValue {
  constructor(public enumName: string, public value: number) {}

  public toString(): string {
    return `${this.enumName}(${this.value})`
  }
}

export class RivId implements RivValue {
  constructor(public value: number) {}

  public toString(): string {
    return `${this.value.toString(16).padStart(2, '0')}`
  }
}

export class RivColor implements RivValue {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number
  ) {}

  public toString(): string {
    return `#${this.toHex(this.r)}${this.toHex(this.g)}${this.toHex(this.b)} (${
      this.a
    })`
  }

  private toHex(v: number): string {
    return v.toString(16).padStart(2, '0')
  }
}

export enum RivObjectType {
  Blackboard = 'blackboard',
  Artboard = 'artboard',
  Shape = 'shape',
  Ellipse = 'ellipse',
  Fill = 'fill',
  SolidColor = 'solidColor',
  LinearAnimation = 'linearAnimation',
  KeyedObject = 'keyedObject',
  KeyedProperty = 'keyedProperty',
  KeyFrameDouble = 'keyFrameDouble',
  Unknown = 'unknown',
}

export enum RivPropertyType {
  Name = 'name',
  AnimationName = 'animationName',
  ArtboardWidth = 'artboardWidth',
  ArtboardHeight = 'artboardHeight',
  ShapeWidth = 'shapeWidth',
  ShapeHeight = 'shapeHeight',
  ShapeX = 'shapeX',
  ShapeY = 'shapeY',
  Parent = 'parent',
  LoopType = 'loopType',
  KeyFrameNumber = 'keyFrameNumber',
  KeyedObjectId = 'keyedObjectId',
  KeyedPropertyCode = 'keyedPropertyCode',
  InterpolationType = 'interpolationType',
  FrameValue = 'frameValue',
  Frame = 'frame',
  Unknown = 'unknown',
  ColorValue = 'colorValue',
}

export enum RivValueType {
  Float = 'float',
}
