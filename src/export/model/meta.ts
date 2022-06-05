import { RivAnimatableProperty } from './animations'

export enum RivObjectType {
  Artboard = 'Artboard',
  Shape = 'Shape',
  Rectangle = 'Rectangle',
  BoneBase = 'BoneBase',
  Bone = 'Bone',
  Fill = 'Fill',
  SolidColor = 'SolidColor',
  Blackboard = 'Blackboard',
}

export class RivObjectMeta {
  constructor(
    readonly type: RivObjectType,
    readonly animatable: RivAnimatableProperty[]
  ) {}
}

export const rivObjectMeta = {
  blackBoard: new RivObjectMeta(RivObjectType.Blackboard, []),
  artboard: new RivObjectMeta(RivObjectType.Artboard, []),
  shape: new RivObjectMeta(RivObjectType.Shape, [
    RivAnimatableProperty.ShapeX,
    RivAnimatableProperty.ShapeY,
  ]),
  rectangle: new RivObjectMeta(RivObjectType.Rectangle, [
    RivAnimatableProperty.ShapeWidth,
    RivAnimatableProperty.ShapeHeight,
  ]),
  boneBase: new RivObjectMeta(RivObjectType.BoneBase, [
    RivAnimatableProperty.BoneLength,
    RivAnimatableProperty.BoneRotation,
  ]),
  bone: new RivObjectMeta(RivObjectType.Bone, [
    RivAnimatableProperty.BoneLength,
    RivAnimatableProperty.BoneRotation,
    RivAnimatableProperty.BoneX,
    RivAnimatableProperty.BoneY,
  ]),
  solidColor: new RivObjectMeta(RivObjectType.SolidColor, [
    RivAnimatableProperty.ColorValue,
  ]),
  fill: new RivObjectMeta(RivObjectType.Fill, []),
}

export enum RivPropertyType {
  Double = 'Double',
  Color = 'Color',
}

export const propertyToType = new Map<RivAnimatableProperty, RivPropertyType>([
  [RivAnimatableProperty.ShapeX, RivPropertyType.Double],
  [RivAnimatableProperty.ShapeY, RivPropertyType.Double],
  [RivAnimatableProperty.ShapeWidth, RivPropertyType.Double],
  [RivAnimatableProperty.ShapeHeight, RivPropertyType.Double],
  [RivAnimatableProperty.BoneLength, RivPropertyType.Double],
  [RivAnimatableProperty.BoneRotation, RivPropertyType.Double],
  [RivAnimatableProperty.BoneX, RivPropertyType.Double],
  [RivAnimatableProperty.BoneY, RivPropertyType.Double],
  [RivAnimatableProperty.ColorValue, RivPropertyType.Color],
])
