export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (timeString) => {
  if (!timeString) return '-'
  // Si c'est déjà au format HH:MM, le retourner tel quel
  if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}/)) {
    return timeString.substring(0, 5) // Prendre seulement HH:MM
  }
  // Sinon, essayer de parser comme une date/heure
  try {
    const date = new Date(`2000-01-01T${timeString}`)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timeString
  }
}

export const formatCurrency = (amount, currency = 'XOF') => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (number) => {
  if (number === null || number === undefined) return '-'
  return new Intl.NumberFormat('fr-FR').format(number)
}

export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-'
  return `${Number(value).toFixed(decimals)}%`
}

