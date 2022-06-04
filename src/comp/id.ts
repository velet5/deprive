export class CompId {
  constructor(readonly value: number) {}
}

export class IdProvider {
  private id = 0

  gen(): CompId {
    return new CompId(this.id++)
  }
}
