import { useState } from 'react'
import { CATEGORIES } from '../data/foods.js'
import FoodGrid from '../components/FoodGrid.jsx'

// Admin "Menu" view: manage the restaurant's menu.
//   - "Add dish" button opens a popup modal with the new-dish form
//   - Each menu card has Edit + Remove buttons; Edit reuses the same
//     popup, pre-filled with the dish's current information
//   - The full menu grid spans the whole page
//
// Changes call handlers up to App, which updates the live `foods` state,
// so the client immediately sees the updated menu.
export default function MenuManagement({ foods, onAddFood, onRemoveFood, onEditFood }) {
  // New-dish / edit-dish form fields (used inside the popup modal).
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('🍽️') // emoji placeholder; swap for a photo URL later
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')

  // Modal open/close + which dish is being edited (null = adding a new dish).
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // Transient banner shown after an add/edit/remove action.
  const [success, setSuccess] = useState('')

  // Reset the form fields back to their defaults.
  function resetForm() {
    setName('')
    setCategory(CATEGORIES[0])
    setPrice('')
    setDescription('')
    setImage('🍽️')
    setAvailable(true)
  }

  function openAddModal() {
    resetForm()
    setEditing(null)
    setError('')
    setModalOpen(true)
  }

  // Open the same popup pre-filled with a dish's info, so the admin
  // can change any of its fields (including availability).
  function openEditModal(food) {
    setName(food.name)
    setCategory(food.category)
    setPrice(String(food.price))
    setDescription(food.description)
    setImage(food.image)
    setAvailable(food.available)
    setEditing(food)
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validation (same rules for add and edit).
    if (!name.trim()) {
      setError('Please enter a dish name.')
      return
    }
    const priceNum = Number(price)
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price (a number greater than 0).')
      return
    }

    const updated = {
      name: name.trim(),
      category,
      price: priceNum,
      description: description.trim() || 'A dish from the kitchen.',
      image: image.trim() || '🍽️',
      available,
    }

    if (editing) {
      // Keep the dish's id so App can replace it in the live menu.
      onEditFood({ ...editing, ...updated })
      setSuccess(`“${updated.name}” was updated.`)
    } else {
      // New dish: id = highest existing id + 1 (a real database would
      // assign this).
      const newId = Math.max(0, ...foods.map((f) => f.id)) + 1
      onAddFood({ id: newId, ...updated })
      setSuccess(`“${updated.name}” was added to the menu.`)
    }

    closeModal()
    resetForm()
  }

  function handleRemove(foodId) {
    const dish = foods.find((f) => f.id === foodId)
    if (dish) {
      onRemoveFood(foodId)
      setSuccess(`“${dish.name}” was removed from the menu.`)
    }
  }

  return (
    <div className="page">
      {/* Full-bleed layout so the menu grid spans the whole page. */}
      <div className="container-wide">
        <div className="menu-toolbar">
          <div>
            <div className="section-band" style={{ margin: 0 }}>
              <div>
                <span className="kanji-eyebrow">管理</span>
                <h2>Menu management</h2>
              </div>
              <span className="band-kicker">管</span>
            </div>
            <p className="section-sub">
              Add, edit, or remove dishes. Changes apply to the live menu for all customers.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add dish
          </button>
        </div>

        {success && (
          <div className="banner success">{success}</div>
        )}

        <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--muted)' }}>
          Current menu ({foods.length} dishes)
        </h3>
        <div className="admin-menu-grid">
          <FoodGrid
            foods={foods}
            mode="admin"
            onRemove={handleRemove}
            onEdit={openEditModal}
          />
        </div>
      </div>

      {/* ---------- Add / edit dish popup modal ---------- */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                {editing ? `Edit “${editing.name}”` : 'Add a new dish'}
              </h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="dish-name">Dish name *</label>
                <input
                  id="dish-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Miso Ramen"
                />
              </div>

              <div className="field">
                <label htmlFor="dish-category">Category</label>
                <select
                  id="dish-category"
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="dish-price">Price (Rp) *</label>
                <input
                  id="dish-price"
                  type="number"
                  min="0"
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 35000"
                />
              </div>

              <div className="field">
                <label htmlFor="dish-desc">Description</label>
                <textarea
                  id="dish-desc"
                  className="input"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description shown on the menu card…"
                />
              </div>

              <div className="field">
                <label htmlFor="dish-image">Image (emoji placeholder)</label>
                <input
                  id="dish-image"
                  className="input"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <div className="hint">Use an emoji for now — real food photos can replace this later.</div>
              </div>

              <div className="field">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  Available for order
                </label>
              </div>

              {error && <div className="banner error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-block">
                {editing ? 'Save changes' : 'Add to menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
