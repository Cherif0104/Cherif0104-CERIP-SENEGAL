import { useState } from 'react'
import './Calendar.css'

export default function Calendar({ 
  events = [], 
  onDateClick, 
  onEventClick,
  month: initialMonth,
  year: initialYear 
}) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(initialMonth || now.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(initialYear || now.getFullYear())

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Lundi = 0

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(now.getMonth() + 1)
    setCurrentYear(now.getFullYear())
  }

  const getEventsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => {
      const eventDate = new Date(event.date)
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      return eventDateStr === dateStr
    })
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear()
    )
  }

  const handleDateClick = (day) => {
    if (onDateClick) {
      const date = new Date(currentYear, currentMonth - 1, day)
      onDateClick(date)
    }
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    if (onEventClick) {
      onEventClick(event)
    }
  }

  // Générer les jours du mois
  const days = []
  // Jours vides avant le premier jour
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null)
  }
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn"
          onClick={goToPreviousMonth}
          aria-label="Mois précédent"
        >
          ←
        </button>
        <div className="calendar-month-year">
          <h3>{monthNames[currentMonth - 1]} {currentYear}</h3>
          <button 
            className="calendar-today-btn"
            onClick={goToToday}
          >
            Aujourd'hui
          </button>
        </div>
        <button 
          className="calendar-nav-btn"
          onClick={goToNextMonth}
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      <div className="calendar-grid">
        {/* En-têtes des jours */}
        {dayNames.map(dayName => (
          <div key={dayName} className="calendar-day-header">
            {dayName}
          </div>
        ))}

        {/* Jours du mois */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day calendar-day--empty" />
          }

          const dayEvents = getEventsForDate(day)
          const today = isToday(day)

          return (
            <div
              key={day}
              className={`calendar-day ${today ? 'calendar-day--today' : ''} ${dayEvents.length > 0 ? 'calendar-day--has-events' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className="calendar-day-number">{day}</div>
              <div className="calendar-events">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="calendar-event"
                    style={{ backgroundColor: event.color || '#14b8a6' }}
                    onClick={(e) => handleEventClick(event, e)}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="calendar-event-more">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

