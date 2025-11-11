import { connect, Component, bindActionCreators } from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  tables: state.tables,
});

const mapDispatchToProps = (dispatch) => ({
  resetForm: (name, key, fields) => {
    dispatch(Store.forms.reset(name, key, fields));
  },
  ...bindActionCreators(Store.tables, dispatch),
});

// eslint-disable-next-line camelcase
class components_tables_components_filter extends Component {
  state = {};

  resetFilterForm = () => {
    this.props.resetForm('Components.forms.filter', `${this.props.tableName}:${this.props.tableKey}`, {
      filterBy: '',
      comparator: '',
      filterValue: '',
    });
    this.setState({ blurAll: false });
  };

  addFilter = () => {
    const form = _try(() => this.props
      .forms['Components.forms.filter'][`${this.props.tableName}:${this.props.tableKey}`]);

    if (!form) {
      return null;
    }

    const key = form._values.filterBy;
    let value = form._values.filterValue;
    const { comparator } = form._values;
    const { type } = this.props.filterConfig[key];

    // Make sure we store a bool as a boolean instead of a string
    if (type === 'bool' && typeof value === 'string') { value = (value !== 'false'); }

    // Sets epoch to start of the selected day since we don't have the UI to set hours, minutes, etc.
    if (type === 'date') { value = form._values.filterValue.setHours(0, 0, 0, 0); }

    this.props.addFilter(this.props.tableName, this.props.tableKey, {
      id: `${key}${comparator}${value}`, key, value, type, comparator,
    });
    this.resetFilterForm();
  };

  render() {
    // Table is required to be able to add/remove filters from the store
    const table = _try(() => this.props.tables[this.props.tableName][this.props.tableKey]);
    if (!table) { return null; }
    const form = _try(() => this.props
      .forms['Components.forms.filter'][`${this.props.tableName}:${this.props.tableKey}`]);
    const currentFilters = _try(() => this.props.tables[this.props.tableName][this.props.tableKey].filters, {});
    const addIsDisabled = _try(() => !form._values.filterBy || !form._values.comparator || !form._values.filterValue);

    return (
      <div className="components_tables_components_filter">
        <div className="mb-3 d-md-flex justify-content-start">
          <h3 className="m-0 mb-2 mr-md-3 text-muted">Filters</h3>
          <div>
            {_try(() => Object.keys(currentFilters), []).map((filterId) => {
              // Handles filters used to display only specific items based on internal properties
              const filter = currentFilters[filterId];
              if (!_try(() => this.props.filterConfig[filter.key])) { return null; }
              return (
                <Components.tables.components.filterChip
                  className="mb-2 me-2 bg-primary"
                  key={`${this.props.tableName}:${this.props.tableKey}:${filterId}`}
                  tableName={this.props.tableName}
                  tableKey={this.props.tableKey}
                  filterId={filterId}
                  filter={filter}
                  filterConfig={this.props.filterConfig}
                />
              );
            })}
          </div>
        </div>
        <div className="row justify-content-between">
          <div className="col-12 col-md">
            <Components.forms.filter
              formKey={`${this.props.tableName}:${this.props.tableKey}`}
              filterConfig={this.props.filterConfig}
              blurAll={this.state.blurAll}
              handleEnterPress={this.addFilter}
            />
          </div>
          <div className="col-12 col-md-auto">
            <Components.button
              className="btn btn-success me-2"
              buttonText="Add"
              onClick={() => { this.addFilter(); }}
              onDisabledClick={() => this.setState({ blurAll: true })}
              disabled={addIsDisabled}
              ariaLabel="Add Filter"
            />
            <Components.button
              className="btn btn-secondary"
              buttonText="Reset"
              onClick={() => { this.resetFilterForm(); }}
              ariaLabel="Reset Current Filter"
              disabled={_try(() => form._allInitial)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_filter);
