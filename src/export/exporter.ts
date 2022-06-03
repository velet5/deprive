import { Deprive } from '../comp/deprive'
import { AnimationWriter } from './animation-writer'
import { RivHeaderWriter } from './header-writer'
import { ObjectWriter } from './object-writer'
import { Untangler } from './untangler'
import { Buffer } from './util/buffer'

export class RivExporter {
  export(deprive: Deprive): Uint8Array {
    return new Impl().export(deprive)
  }
}

class Impl {
  private headerWriter = new RivHeaderWriter()
  private objectWriter = new ObjectWriter()
  private animationWriter = new AnimationWriter()
  private fileId = 1337

  constructor() {}

  export(deprive: Deprive): Uint8Array {
    const riv = new Untangler().untangle(deprive)

    const buffer = new Buffer()
    this.headerWriter.write(buffer, this.fileId)
    this.objectWriter.write(buffer, riv.objects)
    this.animationWriter.write(buffer)
    return buffer.toUint8Array()
  }
}
