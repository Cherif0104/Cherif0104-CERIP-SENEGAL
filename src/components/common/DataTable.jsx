import { useState, useMemo } from 'react'
import { Icon } from './Icon'
import './DataTable.css'

export const DataTable = ({
  columns = [],
  data = [],
  pagination = true,
  pageSize = 10,
  sortable = true,
  onRowClick,
  emptyMessage = 'Aucune donnée disponible'
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key]
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })

    return sorted
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key) => {
    if (!sortable) return

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (data.length === 0) {
    return <div className="data-table-empty">{emptyMessage}</div>
  }

  return (
    <div className="data-table">
      {searchTerm !== undefined && (
        <div className="data-table-search">
          <Icon name="Search" size={20} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="data-table-search-input"
          />
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={sortable ? 'data-table-sortable' : ''}
                >
                  <div className="data-table-header-content">
                    {column.label}
                    {sortable && sortConfig.key === column.key && (
                      <Icon
                        name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                        size={16}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'data-table-clickable' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="data-table-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="data-table-pagination-btn"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <span className="data-table-pagination-info">
            Page {currentPage} sur {totalPages} ({sortedData.length} résultats)
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="data-table-pagination-btn"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

