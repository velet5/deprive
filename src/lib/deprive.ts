import { Animation } from './anim/animation'
import { Artboard } from './artboard'
import { Color } from './color'
import { IdGenerator } from './core'
import { Fill } from './fill'

export class Deprive implements IdGenerator {
  private _id: number = 0

  private artboards: Artboard[] = []
  private _animations: Animation[] = []

  artboard(name: string): Artboard {
    const artborard = new Artboard(this.nextId()).name(name)
    this.artboards.push(artborard)
    return artborard
  }

  fill(color: Color): Fill {
    return new Fill(this.nextId(), null, this).color(color)
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

  listArtboards(): Artboard[] {
    return this.artboards
  }
}
