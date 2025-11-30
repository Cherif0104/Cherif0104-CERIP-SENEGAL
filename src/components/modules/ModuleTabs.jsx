import { useSearchParams } from 'react-router-dom'
import './ModuleTabs.css'

export const ModuleTabs = ({ tabs = [], defaultTab, className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || defaultTab || tabs[0]?.id

  const handleTabClick = (tabId) => {
    setSearchParams({ tab: tabId })
  }

  return (
    <div className={`module-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`module-tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
          {tab.badge && <span className="module-tab-badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  )
}

