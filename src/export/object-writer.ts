import { Shape } from '../comp/object/shapes'
import {
  RivArtboard,
  RivBlackBoard,
  RivObject,
  RivShape,
} from './model/objects'
import { Buffer } from './util/buffer'

const objectId = {
  artboard: 0x01,
  shape: 0x03,
  blackBoard: 0x17,
}

const propId = {
  parent: 0x05,
  artboardWidth: 0x07,
  artboardHeight: 0x08,
  shapeX: 0x0d,
  shapeY: 0x0e,
}

export class ObjectWriter {
  constructor() {}

  write(buffer: Buffer, objects: RivObject[]) {
    objects.forEach((object) => this.writeObject(buffer, object))
  }

  private writeObject(buffer: Buffer, object: RivObject) {
    if (object instanceof RivBlackBoard) {
      this.writeBlackBoard(buffer)
      return
    }

    if (object instanceof RivArtboard) {
      this.writeArtboard(buffer, object)
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

  private writeShape(buffer: Buffer, shape: RivShape) {
    buffer.addByte(objectId.shape)
    buffer.addByte(propId.shapeX)
    buffer.addFloat(shape.x)
    buffer.addByte(propId.shapeY)
    buffer.addFloat(shape.y)
    buffer.addZero()
  }
}
