export type DeliveryPoint = { latitude: number; longitude: number }

export function validPoint(value: unknown): value is DeliveryPoint {
  if (!value || typeof value !== 'object') return false
  const { latitude, longitude } = value as Partial<DeliveryPoint>
  return typeof latitude === 'number' && Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && Math.abs(longitude) <= 180
}

export function mapLink(point: DeliveryPoint) {
  return 'https://www.google.com/maps/search/?api=1&query=' + point.latitude + ',' + point.longitude
}
