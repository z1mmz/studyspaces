export const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { id: 'power_outlets', label: 'Power Outlets', icon: '🔌' },
  { id: 'quiet_zone', label: 'Quiet Zone', icon: '🤫' },
  { id: 'coffee', label: 'Coffee', icon: '☕' },
  { id: 'food_drinks', label: 'Food & Drinks', icon: '🥗' },
  { id: 'printing', label: 'Printing', icon: '🖨️' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'air_conditioning', label: 'AC', icon: '❄️' },
  { id: 'natural_light', label: 'Natural Light', icon: '☀️' },
  { id: 'private_rooms', label: 'Private Rooms', icon: '🚪' },
  { id: 'open_24h', label: '24h Access', icon: '🕐' },
]

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const NOISE_LEVELS = [
  { id: 'quiet', label: 'Quiet', color: 'bg-green-100 text-green-800' },
  { id: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'lively', label: 'Lively', color: 'bg-orange-100 text-orange-800' },
]

export const DEFAULT_HOURS = {
  monday:    { open: '09:00', close: '21:00', closed: false },
  tuesday:   { open: '09:00', close: '21:00', closed: false },
  wednesday: { open: '09:00', close: '21:00', closed: false },
  thursday:  { open: '09:00', close: '21:00', closed: false },
  friday:    { open: '09:00', close: '21:00', closed: false },
  saturday:  { open: '10:00', close: '18:00', closed: false },
  sunday:    { open: '10:00', close: '18:00', closed: false },
}

export const isOpenNow = (hours) => {
  if (!hours) return null
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  const todayHours = hours[today]
  if (!todayHours || todayHours.closed) return false
  const now = new Date()
  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return nowMin >= openH * 60 + openM && nowMin < closeH * 60 + closeM
}

export const avgRating = (reviews) => {
  if (!reviews?.length) return null
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
}
