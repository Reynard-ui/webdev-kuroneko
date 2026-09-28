// Small formatting helper shared across components.
// Prices are stored as plain numbers (in IDR) and shown as "Rp65,000".
export function formatIDR(value) {
  return 'Rp' + value.toLocaleString('id-ID')
}
