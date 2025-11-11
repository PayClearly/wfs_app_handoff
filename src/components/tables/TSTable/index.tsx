import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import classNames from 'classnames';
import Spinner from '../../../../src/components/spinner'
import './index.scss';
export type Column<Data> = {
  header: string | ((props?: Data) => JSX.Element)
  accessor: keyof Data & string
  sortable?: boolean
} | {
  header: string | ((props?: Data) => JSX.Element)
  cellRenderer: (props: Data) => JSX.Element
  accessor?: keyof Data & string
  sortable?: boolean
}

export type TableConfig<Data> = {
  rowIds: Array<string>
  rowData: Record<string, Data>
  columns: Column<Data>[]
  sortConfig?: {
    direction: 'asc' | 'desc',
    key: string | undefined
  }
  requestSort?: (s: string) => void
}

export type ExpandableTableConfig<Data> = TableConfig<Data>
  & { expandable?: false }
  | TableConfig<Data>
  & { expandable: true, expandedRowRenderer: (props: Data) => JSX.Element }

const TSTable = <T,>(props: ExpandableTableConfig<T>) => {
  const { columns, rowData, expandable, rowIds, sortConfig, requestSort } = props

  const [expandedRowId, setExpandedRowId] = useState('');

  const handleRowClick = (e) => {
    const targetElement = e.target.localName;
    const rowId = e.currentTarget.id

    const targetToIngore = {
      input: true,
    }

    // Don't expand the row if ignoring target event
    if (targetToIngore[targetElement]) {
      return;
    }

    rowId === expandedRowId ? setExpandedRowId('') : setExpandedRowId(rowId)
  }

  return (
    <table className="components_tables_TSTable table responsive">
      <thead>
        <tr>
          {columns.map(({ header, accessor, sortable }) => {
            if (typeof header === 'function') {
              return (
                <th>
                  {header()}
                </th>
              )
            }
            return (
              <th
                className={sortable ? 'pointer' : 'cursor'}
                key={header}
                onClick={() => {
                  if (sortable && accessor && typeof requestSort === 'function') {
                    requestSort(accessor)
                  }
                }
                }>
                <span className="small">{header}</span>
                <span className={sortClassNames({ accessor, sortable, sortConfig, classIdentifier: 'asc' })} />
                <span className={sortClassNames({ accessor, sortable, sortConfig, classIdentifier: 'desc' })} />
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {rowIds.map((rowId) => {
          const rowItem = rowData[rowId]
          if (!rowItem) {
            return (
              <tr>
                <Spinner />
              </tr>
            )
          }
          return (
            <>
              <tr
                role='row'
                id={rowId}
                key={rowId}
                className={classNames('fixedHeight', { clickable: expandable ? true : false }, { active: expandedRowId === rowId })}
                onClick={(e) => handleRowClick(e)}
              >
                {columns.map((column) => {
                  if ('cellRenderer' in column) {
                    return (
                      <td className="fixedWidth">
                        {column.cellRenderer(rowItem)}
                      </td>
                    )
                  }
                  return (
                    <td className="fixedWidth">
                      {rowItem[column.accessor] === undefined ? '-' : String(rowItem[column.accessor])}
                    </td>
                  )
                })}
              </tr>
              {expandable &&
                <tr className="collapsibleRow">
                  <td colSpan={columns.length + 1} style={{ padding: 0 }}>
                    <Collapse isOpened={expandedRowId === rowId}>
                      {expandedRowId === rowId && props.expandedRowRenderer(rowItem)}
                    </Collapse>
                  </td>
                </tr>
              }
            </>
          )
        })}
      </tbody>
    </table >
  );
}

type SortClassNames = {
  accessor: string | undefined
  sortable: boolean | undefined
  classIdentifier: 'asc' | 'desc'
  sortConfig: {
    direction: 'asc' | 'desc'
    key: string | undefined
  } | undefined
}
function sortClassNames({ accessor, sortable, sortConfig, classIdentifier }: SortClassNames): string {
  const classIdentiferToIconMap = {
    asc: 'mdi-menu-up',
    desc: 'mdi-menu-down',
  }
  const iconClass = classIdentiferToIconMap[classIdentifier];

  return classNames(
    { [`sort mdi ${iconClass}`]: sortable },
    { 'sort-primary': (sortConfig?.key === accessor && sortConfig?.direction === classIdentifier) },
    { 'sort-primary': (sortConfig?.key === accessor && sortConfig?.direction === classIdentifier) },
  )
}

export default TSTable;