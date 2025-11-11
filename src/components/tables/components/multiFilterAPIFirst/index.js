import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    parentForm: _try(() => state.forms['Components.tables.components.multiFilter'][`${props.tableName}:${props.tableKey}`]),
    valueForms: state.forms['Components.forms.multiFilterValue'],
    conditionForms: state.forms['Components.forms.multiFilterCondition'],
    tables: state.tables,
    params: _resolve(state, 'router.route.params'),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    resetForm: (formName, formKey, fields) => {
      dispatch(Store.forms.reset(formName, formKey, fields));
    },
    initializeForm: (formName, formKey, fields) => {
      dispatch(Store.forms.initialize(formName, formKey, fields));
    },
    destroyForm: (formName, formKey) => {
      dispatch(Store.forms.destroy(formName, formKey));
    },
    initializeFiltered: (orgId, accountId, filters) => {
      dispatch(Store.account.paymentStatuses.initializeFiltered(orgId, accountId, filters));
    },
    setSearchQueryParams: (data) => {
      // setSearchQueryParams wipes params and sets new ones, while setQueryParams just adds new params
      dispatch(Store.router.setSearchQueryParams(data));
    },
    setFormField: (formName, formKey, fieldData, newValue) => {
      dispatch(Store.forms.change(formName, formKey, fieldData, newValue));
    },

    ...bindActionCreators(Store.tables, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_components_multiFilterAPIFirst extends Component {
  state = {
    formName: 'Components.tables.components.multiFilter',
  };

  componentDidMount() {
    const { initializeForm, filterConfig, params } = this.props;
    const initialFormState = {};

    initializeForm(this.state.formName, `${this.props.tableName}:${this.props.tableKey}`, initialFormState);

    const filters = Object.entries(params).reduce((acc, [key, value]) => {
      if (filterConfig[key]) {
        let filterValue;
        let comparator;

        if (value.includes('greaterThan') || value.includes('lessThan')) {
          filterValue = value.split('_').slice(1).join('_');
          comparator = value.split('_')[0];
        } else {
          filterValue = params[key];
          comparator = _adaptComparatorToAPI(FILTER_CONDITIONS_BY_TYPE[filterConfig[key].type].default, key);
        }

        acc[key] = {
          comparator,
          value: filterValue,
        };
      }
      return acc;
    }, {});
    this.props.initializeFiltered(this.props.orgId, this.props.accountId, { filters });
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
    this.props.destroyForm(this.state.formName, `${this.props.tableName}:${this.props.tableKey}`);
  }

  setFilters = () => {
    const { parentForm, filterConfig, tables, tableName, tableKey, orgId, accountId, params = {} } = this.props;
    if (!_try(() => parentForm._children.length)) return;

    const { filterForms, conditionForms } = parentForm._children.reduce((acc, { name, key }) => {
      if (name === 'Components.forms.multiFilterValue') acc.filterForms[key] = _try(() => this.props.valueForms[key], {});
      if (name === 'Components.forms.multiFilterCondition') acc.conditionForms[key] = _try(() => this.props.conditionForms[key], {});
      return acc;
    }, { filterForms: {}, conditionForms: {} });

    const dynamicFilters = Object.values(filterForms).reduce((acc, form) => {
      if (!_try(() => form.filterValue.value || form.filterValue.value === false)) return acc;
      const filterId = form._key.split(':').pop();
      const key = filterConfig[filterId].key;
      const value = _adaptFilterValueToAPI(form.filterValue.value, key);
      const type = filterConfig[filterId].type;
      const comparator = conditionForms[form._key] ? conditionForms[form._key].filterCondition.value : FILTER_CONDITIONS_BY_TYPE[type].default;
      const adaptedComparator = _adaptComparatorToAPI(comparator);
      acc[key] = { value, comparator: adaptedComparator };
      return acc;
    }, {});

    const unadaptedStaticFilters = _try(() => tables[tableName][tableKey].filters, {});

    const staticFilters = Object.entries(unadaptedStaticFilters).reduce((acc, [key, value]) => {
      const adaptedFilter = {};
      if (value.comparator) adaptedFilter.comparator = _adaptComparatorToAPI(value.comparator);
      adaptedFilter.value = _adaptFilterValueToAPI(value.value, key);
      acc[key] = adaptedFilter;
      return acc;
    }, {});

    // the two types of filters, those that are chosen from a list of canned options (static) and those
    // that are typed by the user (dynamic), are stored in different places and work differently
    // so we have two different procedures for retrieving and adapting them to the format expected by our API.

    const filterParams = _transformFiltersToQueryParams({ ...staticFilters, ...dynamicFilters });
    const oldParamsToKeep = Object.keys(params).reduce((acc, key) => (Object.keys(filterConfig).includes(key) ? { ...acc, page: 1 } : { ...acc, [key]: params[key], page: 1 }), {});
    this.props.setSearchQueryParams({ ...oldParamsToKeep, ...filterParams });
    this.props.initializeFiltered(orgId, accountId, { filters: { ...staticFilters, ...dynamicFilters } });
  };

  resetFilters = () => {
    const { tableName, tableKey, resetForm, resetFilters, parentForm, params, filterConfig, setSearchQueryParams } = this.props;
    resetFilters(tableName, tableKey);

    parentForm._children.forEach((child) => {
      resetForm(child.name, child.key, { filterValue: '' });
    });

    const oldParamsToKeep = Object.keys(params).reduce((acc, key) => (Object.keys(filterConfig).includes(key) ? { ...acc } : { ...acc, [key]: params[key] }), {});
    setSearchQueryParams(oldParamsToKeep);
  };

  render() {
    const { filterConfig, tableName, tableKey, valueForms, conditionForms, hideHeader, parentForm } = this.props;

    const formsHaveValue = _try(() => parentForm._children.some(({ name, key }) => {
      return (name === 'Components.forms.multiFilterValue' && _try(() => valueForms[key].filterValue) !== undefined)
        || (name === 'Components.forms.multiFilterCondition' && _try(() => conditionForms[key].filterCondition) !== undefined);
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
              //   disabled={false}
              ariaLabel="Set Search Filters"
            />
            <Components.button
              className="btn btn-secondary"
              buttonText="Clear Fields"
              onClick={this.resetFilters}
              ariaLabel="Clear Search Filters"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_components_multiFilterAPIFirst);

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

function _adaptComparatorToAPI(comparator) {
  if (comparator === 'equals') return 'is';
  if (comparator === 'isBefore') return 'lessThan';
  if (comparator === 'isAfter') return 'greaterThan';
  return comparator;
}

function _adaptFilterValueToAPI(value, key) {
  if (value === true) return 'true';
  if (value === 'complete' && key === 'status') return 'tracked';
  return value;
}

function _transformFiltersToQueryParams(filters) {
  return Object.entries(filters).reduce((acc, [key, filterParams]) => {
    if (filterParams.comparator === 'greaterThan') {
      acc[key] = `greaterThan_${filterParams.value}`;
    } else if (filterParams.comparator === 'lessThan') {
      acc[key] = `lessThan_${filterParams.value}`;
    } else {
      acc[key] = filterParams.value;
    }
    return acc;
  }, {});
}

// GENERATOR_TYPE='component';
