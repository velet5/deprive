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

  //   pub fn leb128_encode_u(src: u64, dest: []u8) u8 {
  //     if (src < 0x80) {
  //         dest[0] = @intCast(u8, src & 0x7f);
  //         return 1;
  //     }
  //     var n: u8 = 0;
  //     var x: u64 = src;
  //     while (true) {
  //         var byte: u8 = @intCast(u8, x & 0x7f);
  //         x = x >> 7;
  //         if (x != 0) {
  //             byte |= 0x80;
  //         }
  //         dest[n] = byte;
  //         n += 1;
  //         if (x == 0) break;
  //     }
  //     return n;
  // }
}
