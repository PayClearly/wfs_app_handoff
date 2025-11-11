import React, { useEffect, useState } from 'react';
import './index.scss'

// will probably need an interface for htmlElementTypes as we introduce difference input types
export type FilterConfig<T> =
  {
    key: keyof T & string;
    label: string;
    htmlElementType: 'select'
    options: {[key: string]: { display: string} };
  } | {
    key: keyof T & string;
    label: string;
    htmlElementType: 'input'
  }

type TSFilterProps<T> = {
  filterConfig: FilterConfig<T>[];
  handleFilterChange: (filters: Record<string, string>) => void
}

const components_forms_TSFilter = <T,>({ filterConfig, handleFilterChange }: TSFilterProps<T>) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) =>{
    e.preventDefault()
    if (e.type === 'reset') {
      setFilters({})
      handleFilterChange({})
    } else {
      handleFilterChange(filters);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement> ) => {
    setFilters({ ...filters, [e.currentTarget.name]: e.currentTarget.value })
  }

  return(
    <div className='m-2'>
      <h3 className='text-muted m-1'>Search Filters</h3>
      <form
        name='tsFilter'
        onSubmit={handleSubmit}
        onReset={handleSubmit}
      >
        <div className='formElementContainer'>
        {
          filterConfig.map(filter => {
            return (
              <div className='m-1'>
                {
                  filter.htmlElementType === 'select' && <TSSelect<T> filterConfig={filter} handleChange={handleChange} filters={filters}/>
                }
              </div>
            )
          })
        }
        </div>
        <button className='btn btn-success' style={{ margin: '2px' }} type='submit'>Apply</button>
        <button className='btn btn-secondary' style={{ margin: '2px' }}type='reset'>Clear</button>
      </form>
    </div>
  )
}

export default components_forms_TSFilter;

type SelectProps<T> = {
  filters: Record<string, string>
  filterConfig: FilterConfig<T>
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

const TSSelect = <T,>(props: SelectProps<T>) => {
  const { filters, filterConfig, handleChange } = props
  return (
    <div key={filterConfig.key} className='m-1'>
      <label>{filterConfig.label}</label>
      <select
        name={filterConfig.key}
        style={{ background: 'transparent', outline: 'none'}}
        onChange={handleChange}
        value={filters[filterConfig.key] || ''}
      >
        <option value='' hidden> Select an option </option>
        { 'options' in filterConfig &&
          Object.keys(filterConfig.options).map(option =>
            <option value={option} key={option}>
              {filterConfig.options[option].display}
            </option>
        )}
      </select>
    </div>
  )
}
