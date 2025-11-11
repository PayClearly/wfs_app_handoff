import { useState, useMemo } from 'react'

type ConfigType = {
  direction: 'asc' | 'desc'
  key: string
}

export const useSortableData = <T extends object>(items: T, ids: (keyof T)[], config: ConfigType = { direction: 'asc', key: '' }) => {
  const [sortConfig, setSortConfig] = useState<ConfigType>(config)

  const sortedIds = useMemo(() => {
    let sortableIds = [...ids]
    const allDataFetched = sortableIds.every((id) => items[id] !== undefined);

    if (sortableIds.length && allDataFetched && sortConfig.key !== '') {
      sortableIds.sort((a, b) => customCompare(a, b, items, sortConfig))
    }
    
    return sortableIds
  }, [items, ids, sortConfig])

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return { sortedRowIds: sortedIds, requestSort, sortConfig }
}

function customCompare<T extends object>(a: keyof T, b: keyof T, items: T, sortConfig: ConfigType): number {
  const typeA: string = typeof items[a][sortConfig.key] || '';
  const typeB: string = typeof items[b][sortConfig.key] || '';
  const valueA = items[a][sortConfig.key]
  const valueB = items[b][sortConfig.key]

  if (typeA < typeB) return sortConfig.direction === "asc" ? -1 : 1;
  if (typeA > typeB) return sortConfig.direction === "asc" ? 1 : -1;

  if (typeA === "number") {
    return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
  } else if (typeA === "string") {
    return sortConfig.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  } else if (Array.isArray(valueA)) {
    return sortConfig.direction === "asc" ? valueA.length - valueB.length : valueB.length - valueA.length;
  } else {
    return 0;
  }
}