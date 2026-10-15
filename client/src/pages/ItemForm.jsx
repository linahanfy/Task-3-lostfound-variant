import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Must match the server's Joi values exactly
const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const STATUSES = ['lost', 'found', 'claimed']

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the item and fill the form
  useEffect(() => {
    if (!id) return
    api.get('/items/' + id)
      .then(res => {
        const { title, status, category, location, description } = res.data.item
        setForm({ title, status, category, location: location ?? '', description: description ?? '' })
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load item'))
  }, [id])

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // Only send these fields — never reportedBy, the server takes it from the token
    const { title, status, category, location, description } = form
    const body = { title, status, category, location, description }
    try {
      if (id) await api.patch('/items/' + id, body)
      else await api.post('/items', body)
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="input" name="title" placeholder="e.g. Black backpack" value={form.title} onChange={onChange} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Status</label>
            <select className="input" name="status" value={form.status} onChange={onChange}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Category</label>
            <select className="input" name="category" value={form.category} onChange={onChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Location (optional)</label>
          <input className="input" name="location" placeholder="e.g. Library 2nd floor" value={form.location} onChange={onChange} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description (optional)</label>
          <textarea className="input" name="description" rows={3} value={form.description} onChange={onChange} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
