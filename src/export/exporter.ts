import { Deprive } from '../comp/deprive'
import { RivHeaderWriter } from './header-writer'
import { Buffer } from './util/buffer'

export class RivExporter {
  export(deprive: Deprive): Uint8Array {
    return new Impl().export(deprive)
  }
}

class Impl {
  private buffer = new Buffer()

  private headerWriter = new RivHeaderWriter()
  private fileId = 1337

  constructor() {}

  export(deprive: Deprive): Uint8Array {
    this.headerWriter.write(this.buffer, this.fileId)
    return this.buffer.toUint8Array()
  }
}
