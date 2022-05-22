import { Artboard } from './artboard'
import { DepriveObject, IdGenerator } from './core'
import { Animation } from './anim/animation'
import { Color } from './color'
import { Fill } from './fill'

export class Deprive implements IdGenerator {
  private _id: number = 0

  private _objects: DepriveObject[] = []
  private _animations: Animation[] = []

  listObjects(): DepriveObject[] {
    return this._objects
  }

  artboard(name: string): Artboard {
    const artborard = new Artboard(this.nextId(), this).name(name)
    this._objects.push(artborard)
    return artborard
  }

  fill(color: Color): Fill {
    return new Fill(this.nextId(), null, null, this).color(color)
  }

  nextId(): number {
    this._id += 1
    return this._id
  }

  animation(name: string): Animation {
    const animation = new Animation(this.nextId()).name(name)
    this._animations.push(animation)
    return animation
  }

  listAnimations(): Animation[] {
    return this._animations
  }
}
