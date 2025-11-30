export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== ''
}

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength
}

export const validatePassword = (password) => {
  // Au moins 6 caractères
  return password && password.length >= 6
}

export const validatePhone = (phone) => {
  // Format téléphone sénégalais ou international
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
  return !phone || re.test(phone)
}

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true
  return new Date(startDate) <= new Date(endDate)
}

export const validatePositiveNumber = (value) => {
  const num = Number(value)
  return !isNaN(num) && num >= 0
}

