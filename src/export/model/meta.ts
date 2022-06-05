import { RivAnimatableProperty } from './animations'

export enum RivObjectType {
  Artboard = 'Artboard',
  Shape = 'Shape',
  Ellipse = 'Ellipse',
  Rectangle = 'Rectangle',
  BoneBase = 'BoneBase',
  Bone = 'Bone',
  Fill = 'Fill',
  SolidColor = 'SolidColor',
  Blackboard = 'Blackboard',
  Node = 'Node',
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
  node: new RivObjectMeta(RivObjectType.Node, [
    RivAnimatableProperty.X,
    RivAnimatableProperty.Y,
    RivAnimatableProperty.Rotation,
  ]),
  shape: new RivObjectMeta(RivObjectType.Shape, [
    RivAnimatableProperty.X,
    RivAnimatableProperty.Y,
  ]),
  ellipse: new RivObjectMeta(RivObjectType.Ellipse, [
    RivAnimatableProperty.ShapeWidth,
    RivAnimatableProperty.ShapeHeight,
  ]),
  rectangle: new RivObjectMeta(RivObjectType.Rectangle, [
    RivAnimatableProperty.ShapeWidth,
    RivAnimatableProperty.ShapeHeight,
  ]),
  boneBase: new RivObjectMeta(RivObjectType.BoneBase, [
    RivAnimatableProperty.BoneLength,
    RivAnimatableProperty.Rotation,
  ]),
  bone: new RivObjectMeta(RivObjectType.Bone, [
    RivAnimatableProperty.BoneLength,
    RivAnimatableProperty.Rotation,
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
  [RivAnimatableProperty.X, RivPropertyType.Double],
  [RivAnimatableProperty.Y, RivPropertyType.Double],
  [RivAnimatableProperty.ShapeWidth, RivPropertyType.Double],
  [RivAnimatableProperty.ShapeHeight, RivPropertyType.Double],
  [RivAnimatableProperty.BoneLength, RivPropertyType.Double],
  [RivAnimatableProperty.Rotation, RivPropertyType.Double],
  [RivAnimatableProperty.BoneX, RivPropertyType.Double],
  [RivAnimatableProperty.BoneY, RivPropertyType.Double],
  [RivAnimatableProperty.ColorValue, RivPropertyType.Color],
])
