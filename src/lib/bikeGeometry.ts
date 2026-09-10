export interface FrameGeometrySize {
  /** Size label as the manufacturer states it, e.g. 'M', '56', or 'S3'. */
  size: string
  stackMm: number
  reachMm: number
}

export interface BikeGeometryPreset {
  /** Matches a BikeModelPreset id in lib/bikes.ts */
  modelId: string
  sizes: FrameGeometrySize[]
  note?: string
}

export const BIKE_GEOMETRY: BikeGeometryPreset[] = []

export function geometryFor(modelId: string): BikeGeometryPreset | undefined {
  return BIKE_GEOMETRY.find((g) => g.modelId === modelId)
}

export function stackReachRatio(stackMm: number, reachMm: number): number {
  return stackMm / reachMm
}
