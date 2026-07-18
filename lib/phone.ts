// Agents only enter their 10-digit local Colombian number (no country code —
// see the settings form). wa.me requires the full international number with
// no leading + or 0, so every WhatsApp deep link must prepend it here.
const COLOMBIA_COUNTRY_CODE = "57"

export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith(COLOMBIA_COUNTRY_CODE) ? digits : `${COLOMBIA_COUNTRY_CODE}${digits}`
}

// Sanitizes the settings form's phone input as the user types: strips
// everything but digits, drops an accidentally-typed "57" country code
// (with or without a leading +, which \D already removes), and caps the
// result at the 10-digit local length the field expects.
export function sanitizePhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "")
  if (digits.length > 10 && digits.startsWith(COLOMBIA_COUNTRY_CODE)) {
    digits = digits.slice(COLOMBIA_COUNTRY_CODE.length)
  }
  return digits.slice(0, 10)
}
