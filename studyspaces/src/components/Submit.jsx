import { useState } from 'react'
import { AMENITIES, DAYS, DEFAULT_HOURS, NOISE_LEVELS } from '../constants'
import dataService from '../services/dataService'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

const Submit = ({ position, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    lat: position.lat,
    lon: position.lon,
    noise_level: 'moderate',
    amenities: [],
    photos: [''],
  })
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const toggleAmenity = (id) => {
    set('amenities', form.amenities.includes(id)
      ? form.amenities.filter((a) => a !== id)
      : [...form.amenities, id])
  }

  const setHourField = (day, field, value) =>
    setHours((h) => ({ ...h, [day]: { ...h[day], [field]: value } }))

  const handlePhotoChange = (i, value) => {
    const updated = [...form.photos]
    updated[i] = value
    set('photos', updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.lat || !form.lon) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        noise_level: form.noise_level,
        amenities: form.amenities,
        photos: form.photos.filter((p) => p.trim()),
        hours,
      }
      const created = await dataService.addSpace(payload)
      onSubmit(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Add a Study Space</h2>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>

      {/* Basic info */}
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Name *</label>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Address</label>
          <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>Latitude *</label>
            <input className={inputCls} type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} required />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Longitude *</label>
            <input className={inputCls} type="number" step="any" value={form.lon} onChange={(e) => set('lon', e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Noise level */}
      <div>
        <label className={labelCls}>Noise Level</label>
        <div className="flex gap-2">
          {NOISE_LEVELS.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => set('noise_level', n.id)}
              className={`flex-1 py-1.5 text-sm rounded-lg border-2 font-medium transition-colors ${
                form.noise_level === n.id ? 'border-blue-500 ' + n.color : 'border-gray-200 text-gray-500'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className={labelCls}>Amenities</label>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((a) => (
            <label key={a.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.amenities.includes(a.id)}
                onChange={() => toggleAmenity(a.id)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">{a.icon} {a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className={labelCls}>Photo URLs</label>
        <div className="flex flex-col gap-2">
          {form.photos.map((url, i) => (
            <input
              key={i}
              className={inputCls}
              placeholder="https://..."
              value={url}
              onChange={(e) => handlePhotoChange(i, e.target.value)}
            />
          ))}
          <button
            type="button"
            onClick={() => set('photos', [...form.photos, ''])}
            className="text-sm text-blue-600 hover:underline text-left"
          >
            + Add another photo
          </button>
        </div>
      </div>

      {/* Hours */}
      <div>
        <label className={labelCls}>Hours</label>
        <div className="flex flex-col gap-1.5">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-2 text-sm">
              <span className="capitalize w-24 text-gray-600 shrink-0">{day}</span>
              <input
                type="time"
                disabled={hours[day].closed}
                value={hours[day].open}
                onChange={(e) => setHourField(day, 'open', e.target.value)}
                className="border border-gray-200 rounded px-2 py-1 text-xs disabled:opacity-40"
              />
              <span className="text-gray-400">–</span>
              <input
                type="time"
                disabled={hours[day].closed}
                value={hours[day].close}
                onChange={(e) => setHourField(day, 'close', e.target.value)}
                className="border border-gray-200 rounded px-2 py-1 text-xs disabled:opacity-40"
              />
              <label className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                <input
                  type="checkbox"
                  checked={hours[day].closed}
                  onChange={(e) => setHourField(day, 'closed', e.target.checked)}
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving...' : 'Add Study Space'}
      </button>
    </form>
  )
}

export default Submit
