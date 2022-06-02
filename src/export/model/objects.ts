export interface RivObject {}

export class RivBlackBoard implements RivObject {}

export class RivArtBoard implements RivObject {
  constructor(readonly width: number, readonly height: number) {}
}

export class RivShape implements RivObject {
  constructor(readonly x: number, readonly y: number) {}
}

export class RivRectangle implements RivObject {
  constructor(readonly width: number, readonly height: number) {}
}
