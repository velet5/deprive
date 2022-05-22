export module Leb128 {
  export function encodeUnsigned(src: number): Uint8Array {
    const buf = [] as number[]

    if (src < 0x80) {
      buf.push(src & 0x7f)
    } else {
      let x = src

      while (true) {
        let byte = x & 0x7f
        x = x >> 7
        if (x !== 0) {
          byte = byte | 0x80
        }
        buf.push(byte)
        if (x === 0) {
          break
        }
      }
    }

    return new Uint8Array(buf)
  }
}
