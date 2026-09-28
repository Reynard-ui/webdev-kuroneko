import { useState } from 'react'
import { formatIDR } from '../utils/format.js'
import OrderSummary from '../components/OrderSummary.jsx'

// OrderSummary reads the live cart shape ({ [foodId]: { food, qty } }), so
// build a synthetic one from the pending order's item lines.
function cartFromOrder(order) {
  return Object.fromEntries(
    order.items.map((it) => [
      it.foodId,
      { food: { id: it.foodId, name: it.name, price: it.price }, qty: it.quantity },
    ]),
  )
}

// The payment-details page, shown between the order form and the receipt.
// The customer enters their phone number and card details; confirming
// finalizes the pending order and routes to the transaction/receipt page.
export default function Payment({ order, onConfirm }) {
  const [phone, setPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('') // raw digits, max 16
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('') // raw digits -> MMYY
  const [cvc, setCvc] = useState('')
  const [error, setError] = useState('')

  // Live-format the card number into 4-digit groups as the customer types.
  const cardDisplay = cardNumber.replace(/(.{4})/g, '$1 ').trim()
  // Live-format the expiry into MM/YY as the customer types.
  const expiryDisplay = expiry.length > 2 ? expiry.slice(0, 2) + '/' + expiry.slice(2) : expiry

  function onCardNumberChange(e) {
    setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))
  }
  function onExpiryChange(e) {
    setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))
  }
  function onCvcChange(e) {
    setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
  }
  function onPhoneChange(e) {
    setPhone(e.target.value.replace(/[^\d+\s-]/g, ''))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      setError('Please enter a valid phone number.')
      return
    }

    if (cardNumber.length !== 16) {
      setError('Card number must be 16 digits.')
      return
    }

    if (cardName.trim().length < 2) {
      setError('Please enter the name on the card.')
      return
    }

    const mm = parseInt(expiry.slice(0, 2), 10)
    const yy = parseInt(expiry.slice(2, 4), 10)
    if (expiry.length !== 4 || mm < 1 || mm > 12) {
      setError('Expiry must be in MM/YY format.')
      return
    }
    // Reject cards that have already passed their expiry (year or month).
    const now = new Date()
    const curYY = now.getFullYear() % 100
    const curMM = now.getMonth() + 1
    if (yy < curYY || (yy === curYY && mm < curMM)) {
      setError('This card has expired. Please use a valid card.')
      return
    }

    if (cvc.length < 3) {
      setError('CVC must be 3 or 4 digits.')
      return
    }

    // Everything checks out — confirm the payment and route to the receipt.
    onConfirm()
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-band">
          <div>
            <span className="kanji-eyebrow">支払</span>
            <h2>Payment details</h2>
          </div>
          <span className="band-kicker">金</span>
        </div>
        <p className="section-sub">
          Enter your phone number and card, then confirm to complete order #{order.id}.
        </p>

        <form className="split" onSubmit={handleSubmit} noValidate>
          {/* Left: the payment fields */}
          <div className="form-card">
            <h3 style={{ fontSize: 18, marginBottom: 18 }}>Contact &amp; card</h3>

            <div className="field">
              <label htmlFor="pay-phone">Phone number</label>
              <input
                id="pay-phone"
                className="input"
                type="tel"
                placeholder="0812 3456 7890"
                value={phone}
                onChange={onPhoneChange}
              />
              <div className="hint">Used for order &amp; delivery updates.</div>
            </div>

            <div className="field">
              <label htmlFor="pay-card">Credit card number</label>
              <input
                id="pay-card"
                className="input"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={cardDisplay}
                onChange={onCardNumberChange}
              />
              <div className="hint">16 digits — Visa, Mastercard, or JCB.</div>
            </div>

            <div className="field">
              <label htmlFor="pay-name">Name on card</label>
              <input
                id="pay-name"
                className="input"
                placeholder="As printed on the card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="options">
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="pay-exp">Expiry</label>
                <input
                  id="pay-exp"
                  className="input"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiryDisplay}
                  onChange={onExpiryChange}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="pay-cvc">CVC</label>
                <input
                  id="pay-cvc"
                  className="input"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvc}
                  onChange={onCvcChange}
                />
              </div>
            </div>

            {error && <div className="banner error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block">
              Pay {formatIDR(order.total)} · Confirm order
            </button>
          </div>

          {/* Right: what this payment covers, built from the pending order. */}
          <OrderSummary
            cart={cartFromOrder(order)}
            subtotal={order.subtotal}
            deliveryFee={order.deliveryFee}
            total={order.total}
          />
        </form>
      </div>
    </div>
  )
}
