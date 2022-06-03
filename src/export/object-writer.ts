import {
  RivArtboard,
  RivBlackBoard,
  RivExportedObject,
  RivFill,
  RivObject,
  RivRectangle,
  RivShape,
  RivSolidColor,
} from './model/objects'
import { Buffer } from './util/buffer'

const objectId = {
  artboard: 0x01,
  shape: 0x03,
  rectangle: 0x07,
  solidColor: 0x12,
  fill: 0x14,
  blackBoard: 0x17,
}

const propId = {
  parent: 0x05,
  artboardWidth: 0x07,
  artboardHeight: 0x08,
  shapeX: 0x0d,
  shapeY: 0x0e,
  shapeWidth: 0x14,
  shapeHeight: 0x15,
  colorValue: 0x25,
}

export class ObjectWriter {
  constructor() {}

  write(buffer: Buffer, objects: RivExportedObject[]) {
    objects.forEach((object) => this.writeObject(buffer, object))
  }

  private writeObject(buffer: Buffer, exported: RivExportedObject) {
    const parentId = exported.parentId
    const object = exported.object

    if (object instanceof RivBlackBoard) {
      this.writeBlackBoard(buffer)
      return
    }

    if (object instanceof RivArtboard) {
      this.writeArtboard(buffer, object)
      return
    }

    if (object instanceof RivShape) {
      this.writeShape(buffer, parentId, object)
      return
    }

    if (object instanceof RivRectangle) {
      this.writeRectangle(buffer, parentId, object)
      return
    }

    if (object instanceof RivSolidColor) {
      this.writeSolidColor(buffer, parentId, object)
      return
    }

    if (object instanceof RivFill) {
      this.writeFill(buffer, parentId)
      return
    }

    throw new Error(`Object ${object.constructor.name} is not supported`)
  }

  private writeBlackBoard(buffer: Buffer) {
    buffer.addByte(objectId.blackBoard)
    buffer.addZero()
  }

  private writeArtboard(buffer: Buffer, artboard: RivArtboard) {
    buffer.addByte(objectId.artboard)
    buffer.addByte(propId.artboardWidth)
    buffer.addFloat(artboard.width)
    buffer.addByte(propId.artboardHeight)
    buffer.addFloat(artboard.height)
    buffer.addZero()
  }

  private writeShape(buffer: Buffer, parentId: number, shape: RivShape) {
    buffer.addByte(objectId.shape)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.shapeX)
    buffer.addFloat(shape.x)
    buffer.addByte(propId.shapeY)
    buffer.addFloat(shape.y)
    buffer.addZero()
  }

  private writeRectangle(
    buffer: Buffer,
    parentId: number,
    rectangle: RivRectangle
  ) {
    buffer.addByte(objectId.rectangle)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.shapeWidth)
    buffer.addFloat(rectangle.width)
    buffer.addByte(propId.shapeHeight)
    buffer.addFloat(rectangle.height)
    buffer.addZero()
  }

  private writeSolidColor(
    buffer: Buffer,
    parentId: number,
    solidColor: RivSolidColor
  ) {
    buffer.addByte(objectId.solidColor)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.colorValue)
    buffer.addByte(solidColor.r)
    buffer.addByte(solidColor.g)
    buffer.addByte(solidColor.b)
    buffer.addByte(solidColor.a)
    buffer.addZero()
  }

  private writeFill(buffer: Buffer, parentId: number) {
    buffer.addByte(objectId.fill)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addZero()
  }
}
