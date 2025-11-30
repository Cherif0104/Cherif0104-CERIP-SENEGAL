import * as LucideIcons from 'lucide-react'

export const Icon = ({ name, size = 20, color, className = '', ...props }) => {
  const LucideIcon = LucideIcons[name]

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      className={className}
      {...props}
    />
  )
}

