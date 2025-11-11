import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    tables: state.tables,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    initializeForm: (formName, formKey, fields) => {
      dispatch(Store.forms.initialize(formName, formKey, fields));
    },
    destroyForm: (formName, formKey) => {
      dispatch(Store.forms.destroy(formName, formKey));
    },
    ...bindActionCreators(Store.tables, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_components_multiFilter extends Component {
  state = {
    formName: 'Components.tables.components.multiFilter',
  }

  componentDidMount() {
    const {
      initializeForm,
    } = this.props;
    const initialFormState = {};

    initializeForm(this.state.formName, `${this.props.tableName}:${this.props.tableKey}`, initialFormState);
  }
  componentWillUnmount() {
    this.props.destroyForm(this.state.formName, `${this.props.tableName}:${this.props.tableKey}`);
  }

  setFilters = () => {
    const { forms, filterConfig } = this.props;
    const parentForm = _try(() => forms[this.state.formName][`${this.props.tableName}:${this.props.tableKey}`]);
    if (!_try(() => parentForm._children.length)) return;
    const filterForms = {};
    const conditionForms = {};
    parentForm._children.forEach((child) => {
      if (child.name === 'Components.forms.multiFilterValue') filterForms[child.key] = _try(() => forms[child.name][child.key], {});
      if (child.name === 'Components.forms.multiFilterCondition') conditionForms[child.key] = _try(() => forms[child.name][child.key], {});
    });

    const filtersToSet = [];
    Object.values(filterForms).forEach((form) => {
      const hasFilterValue = _try(() => form.filterValue.value || form.filterValue.value === false);
      if (!hasFilterValue) return;
      const filterId = form._key.split(':').pop();
      const key = filterConfig[filterId].key;
      let value = form.filterValue.value;
      const type = filterConfig[filterId].type;
      let comparator = FILTER_CONDITIONS_BY_TYPE[type].default;
      if (conditionForms[form._key]) {
        comparator = conditionForms[form._key].filterCondition.value;
      } else if (_try(() => filterConfig[filterId].condition)) {
        comparator = filterConfig[filterId].condition;
      }

      // Make sure we store a bool as a boolean instead of a string
      if (type === 'bool' && typeof value === 'string') value = (value !== 'false');
      // Sets epoch to start of the selected day since we don't have the UI to set hours, minutes, etc.
      if (type === 'date') value = form._values.filterValue.setHours(0, 0, 0, 0);

      // we will assume that we have a value since we've checked that the form value is not equal to the initial form value state
      if (filterId && key && type && comparator) filtersToSet.push({ id: filterId, key, value, type, comparator });
    });

    filtersToSet.forEach((filter) => {
      this.props.addFilter(this.props.tableName, this.props.tableKey, filter);
    });
  }

  resetFilters = () => {
    // we do not need to reset the filter forms because whenever we flip a filter from form => value the form will destroy and re-init when rendered again. So simply removing filters in the table will result in re-initialized filter value/condition forms
    this.props.resetFilters(this.props.tableName, this.props.tableKey);
  }

  render() {
    const { filterConfig, tableName, tableKey, forms, hideHeader } = this.props;

    const parentForm = _try(() => forms[this.state.formName][`${this.props.tableName}:${this.props.tableKey}`], {});
    const formsHaveValue = _try(() => parentForm._children.some((child) => {
      if (child.name === 'Components.forms.multiFilterValue' && _try(() => forms[child.name][child.key].filterValue.value, {})) return true;
      return false;
    }));

    return (
      <div className="components_tables_components_multiFilter">
        <div className="d-md-flex justify-content-between align-items-center">
          {!hideHeader && <h3 className="text-muted mb-2 mb-md-0">Search Filters</h3>}
        </div>
        <div className="row mt-2">
          {Object.keys(filterConfig).map((filterKey) => {
            const filterDefinition = filterConfig[filterKey];
            return (
              <div className="col-12 col-md-2 mb-2 mb-md-0 widget-container">
                <Components.tables.components.multiFilterWidget
                  tableName={tableName}
                  tableKey={tableKey}
                  parentFormName={this.state.formName}
                  filterDefinition={filterDefinition}
                  filterKey={filterKey}
                  filterConditionOptions={FILTER_CONDITIONS_BY_TYPE}
                // defaultFilter...
                />
              </div>
            );
          })
          }
          <div className="col-12 col-md-2 mb-2 mb-md-0 widget-container">
            <Components.button
              className="btn btn-success me-2"
              buttonText="Search"
              onClick={this.setFilters}
              disabled={_try(() => !formsHaveValue)}
              ariaLabel="Set Search Filters"
            />
            <Components.button
              className="btn btn-secondary"
              buttonText="Clear"
              onClick={this.resetFilters}
              ariaLabel="Clear Search Filters"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_components_multiFilter);

// Internal Helper Functions ...
const FILTER_CONDITIONS_BY_TYPE = {
  string: {
    options: {
      includes: { display: 'Includes' },
      excludes: { display: 'Excludes' },
      equals: { display: 'Equals' },
    },
    default: 'includes',
  },
  number: {
    options: {
      equals: { display: 'Equals', icon: 'mdi-equal' },
      greaterThan: { display: 'Greater Than', icon: 'mdi-greater-than' },
      lessThan: { display: 'Less Than', icon: 'mdi-less-than' },
    },
    default: 'equals',
    displayConditions: true,
  },
  bool: {
    options: {
      is: { display: 'Is' },
    },
    default: 'is',
  },
  date: {
    options: {
      isBefore: { display: 'Is Before' },
      isAfter: { display: 'Is After' },
    },
    default: 'isBefore',
  },
  option: {
    options: {
      is: { display: 'Is' },
      isNot: { display: 'Is Not' },
    },
    default: 'is',
  },
};
// const FILTER_CONDITIONS_BY_TYPE = {
//   string: {
//     includes: { display: 'Includes' },
//     excludes: { display: 'Excludes' },
//     equals: { display: 'Equals' },
//   },
//   number: {
//     equals: { display: 'Equals' },
//     greaterThan: { display: 'Is Greater Than (>)' },
//     lessThan: { display: 'Is Less Than (<)' },
//   },
//   bool: {
//     is: { display: 'Is' },
//   },
//   date: {
//     isBefore: { display: 'Is Before' },
//     isAfter: { display: 'Is After' },
//   },
//   option: {
//     is: { display: 'Is' },
//     isNot: { display: 'Is Not' },
//   },
// };

// GENERATOR_TYPE='component';
