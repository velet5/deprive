export interface RivObject {}

export type RivExportedObject = {
  parentId: number
  object: RivObject
}

export class RivBlackBoard implements RivObject {}

export class RivArtboard implements RivObject {
  constructor(readonly width: number, readonly height: number) {}
}

export class RivShape implements RivObject {
  constructor(readonly x: number, readonly y: number) {}
}

export class RivRectangle implements RivObject {
  constructor(readonly width: number, readonly height: number) {}
}

export class RivSolidColor implements RivObject {
  constructor(
    readonly r: number,
    readonly g: number,
    readonly b: number,
    readonly a: number
  ) {}
}

export class RivFill implements RivObject {
  constructor() {}
}
