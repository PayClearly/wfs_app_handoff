import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  table: _try(() => state.tables[props.tableName][props.tableKey]),
  valueForm: _try(() => state.forms[
    'Components.forms.multiFilterValue'
  ][`${props.tableName}:${props.tableKey}:${props.filterKey}`]),
  conditionForm: _try(() => state.forms[
    'Components.forms.multiFilterCondition'
  ][`${props.tableName}:${props.tableKey}:${props.filterKey}`]),
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(Store.tables, dispatch),
});

// eslint-disable-next-line camelcase
class components_tables_components_multiFilterWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterId: `${props.filterKey}`,
    };
  }

  componentWillReceiveProps(nextProps = {}) {
    if (this.state.previousFilter && _try(() => nextProps.table.filters[this.state.filterId])) {
      this.setState({ previousFilter: null });
    }
  }

  componentDidUpdate(prevProps = {}) {
    if (_try(() => this.props.filterDefinition.type === 'bool'
      || this.props.filterDefinition.type === 'option'
      || this.props.filterDefinition.type === 'date')) {
      const form = _try(() => prevProps.valueForm);
      const nextForm = _try(() => this.props.valueForm);

      if (_try(() => nextForm.filterValue.value)
        && _try(() => form.filterValue.value !== nextForm.filterValue.value)) {
        this.setFilter();
      }
    }
  }

  setFilter = () => {
    const {
      valueForm, conditionForm, filterDefinition, filterConditionOptions,
    } = this.props;

    if (!valueForm) { return; }
    const hasFilterValue = _try(() => valueForm.filterValue.value || valueForm.filterValue.value === false);
    if (!hasFilterValue) { return; }

    const { filterId } = this.state;
    const { key } = filterDefinition;
    let { value } = valueForm.filterValue;
    const { type } = filterDefinition;
    let comparator = filterConditionOptions[type].default;
    if (conditionForm) {
      comparator = conditionForm.filterCondition.value;
    } else if (_try(() => filterDefinition.condition)) {
      comparator = filterDefinition.condition;
    }

    // Make sure we store a bool as a boolean instead of a string
    if (type === 'bool' && typeof value === 'string') { value = (value !== 'false'); }
    // Sets epoch to start of the selected day since we don't have the UI to set hours, minutes, etc.
    if (type === 'date') {
      if (filterDefinition?.condition === 'isBefore') {
        value = valueForm._values.filterValue.setHours(23, 59, 59, 999);
      } else {
        value = valueForm._values.filterValue.setHours(0, 0, 0, 0);
      }
    }

    this.props.addFilter(this.props.tableName, this.props.tableKey, {
      id: filterId, key, value, type, comparator,
    });
  };

  removeFilter = () => {
    this.props.removeFilter(this.props.tableName, this.props.tableKey, this.state.filterId);
  };

  handleEditClick = (tableName, tableKey, filterId) => {
    const { table } = this.props;
    const filter = _try(() => table.filters[filterId]);
    this.setState({ previousFilter: { ...filter } }, this.removeFilter);
  };

  render() {
    const { table } = this.props;
    if (!table) { return null; }
    const currentFilter = _try(() => table.filters[this.state.filterId]);

    const filterType = _try(() => this.props.filterDefinition.type);

    return (
      <div className="components_tables_components_multiFilterWidget has-conditions">
        {currentFilter
          && <Components.tables.components.multiFilterChip
            className="mb-2 me-2 bg-primary"
            tableName={this.props.tableName}
            tableKey={this.props.tableKey}
            filterId={this.state.filterId}
            filter={currentFilter}
            filterConfig={{ [this.props.filterKey]: this.props.filterDefinition }}
            handleEdit={this.handleEditClick}
            conditionDefinition={this.props.filterConditionOptions[filterType]}
          />}
        {!currentFilter
          && (
            <>
              {_try(() => this.props.filterConditionOptions[filterType].displayConditions)
                && <Components.forms.multiFilterCondition
                  formKey={`${this.props.tableName}:${this.props.tableKey}:${this.state.filterId}`}
                  parent={{
                    formName: this.props.parentFormName,
                    formKey: `${this.props.tableName}:${this.props.tableKey}`,
                  }}
                  conditionOptions={this.props.filterConditionOptions[filterType].options}
                  initialData={this.state.previousFilter
                    ? { filterCondition: this.state.previousFilter.comparator }
                    : null}
                  filterId={this.state.filterId}
                />}
              <Components.forms.multiFilterValue
                formKey={`${this.props.tableName}:${this.props.tableKey}:${this.state.filterId}`}
                parent={{
                  formName: this.props.parentFormName,
                  formKey: `${this.props.tableName}:${this.props.tableKey}`,
                }}
                filterDefinition={this.props.filterDefinition}
                handleEnterPress={this.setFilter}
                initialData={this.state.previousFilter ? { filterValue: this.state.previousFilter.value } : null}
                initialFocus={this.state.previousFilter}
                filterId={this.state.filterId}
              />
            </>
          )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_multiFilterWidget);
