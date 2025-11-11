import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_filter extends Component {
  state = {
    name: 'Components.forms.filter',
  }

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({ key });

    const initialFormState = {
      filterBy: '',
      comparator: '',
      filterValue: '',
    };

    initialize(this.state.name, key, initialFormState);
    validate(this.state.name, key, this.validate);

  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  validate = (values) => {
    const errors = {};

    return errors;
  };
  
  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = { [field]: value };

      if (field === 'filterBy') {
        // preset the comparator
        fields.comparator = _try(() => Object.keys(FILTER_CONDITIONS_BY_TYPE[this.props.filterConfig[value].type])[0], ''); 

        // preset the value if options instead of input
        fields.filterValue = '';
        if (_try(() => this.props.filterConfig[value].type === 'bool')) fields.filterValue = 'true';
        if (_try(() => this.props.filterConfig[value].type === 'option')) fields.filterValue = _try(() => Object.keys(this.props.filterConfig[value].options)[0], '');
      }

      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  onSubmit = (e) => {
    e.preventDefault();
  }

  handleEnterPress = (e) => {
    if (e.target.getAttribute('data-field-name') === 'filterValue' && e.keyCode === 13) {
      console.log('in correct scenario');
      // we have an enter press on the filtervalue field
      e.preventDefault();
      if (typeof this.props.handleEnterPress === 'function') this.props.handleEnterPress();
    }
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    const filterType = _try(() => this.props.filterConfig[form._values.filterBy].type);

    // need to prevent default submit on enter keypress for text input
    return (
      <form
        className="components_forms_filter floating-labels form-group-noBottomMargin"
        onSubmit={this.onSubmit}
        onKeyDown={this.handleEnterPress}
      >
        <div className="row">
          <div className="col-12 col-md-4">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="filterBy"
              action={this.standardFormAction}
              label="Filter By"
              options={Object.values(this.props.filterConfig || {}).reduce((acc, cur) => { acc[cur.key] = { display: cur.display }; return acc; }, { '': { display: 'None' } })}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="comparator"
              action={this.standardFormAction}
              label="Filter Condition"
              options={_try(() => FILTER_CONDITIONS_BY_TYPE[this.props.filterConfig[form._values.filterBy].type], {})}
              disabled={!form._values.filterBy || _try(() => this.props.filterConfig[form._values.filterBy].type === 'bool')}
              placeholder="Choose filter by..."
            />
          </div>
          <div className="col-12 col-md-4">
            {(filterType === 'string' || !filterType) && 
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="filterValue"
                action={this.standardFormAction}
                label="Filter Value"
                hideError={!form.filterValue.touched}
                disabled={!form._values.filterBy || !form._values.comparator}
              />
            }
            {(filterType === 'number') && 
              <Components.forms.components.textinput
                form={form}
                type="number"
                field="filterValue"
                action={this.standardFormAction}
                label="Filter Value"
                hideError={!form.filterValue.touched}
                disabled={!form._values.filterBy || !form._values.comparator}
              />
            }
            {(filterType === 'bool') && 
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="filterValue"
                action={this.standardFormAction}
                label="Filter Value"
                options={{
                  true: {
                    display: _try(() => this.props.filterConfig[form._values.filterBy].valueDisplay || 'True'),
                  },
                  false: {
                    display: _try(() => this.props.filterConfig[form._values.filterBy].valueDisplay) ? `Not ${_try(() => this.props.filterConfig[form._values.filterBy].valueDisplay)}` : 'False',
                  },
                }}
                hideError={!form.filterValue.touched}
                disabled={!form._values.filterBy || !form._values.comparator}
                placeholder="Choose Value"
              />
            }
            {(filterType === 'option') && 
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="filterValue"
                action={this.standardFormAction}
                label="Filter Value"
                options={_try(() => this.props.filterConfig[form._values.filterBy].options, {})}
                hideError={!form.filterValue.touched}
                disabled={!form._values.filterBy || !form._values.comparator}
                placeholder="Choose Value"
              />
            }
            {(filterType === 'date') && 
              <Components.forms.components.daypicker
                form={form}
                type="number"
                field="filterValue"
                action={this.standardFormAction}
                label="Filter Value"
                hideError={!form.filterValue.touched}
                disabled={!form._values.filterBy || !form._values.comparator}
              />
            }
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_filter);

// Internal Helper Functions ... 
const FILTER_CONDITIONS_BY_TYPE = {
  string: {
    includes: { display: 'Includes' },
    excludes: { display: 'Excludes' },
    equals: { display: 'Equals' },
  },
  number: {
    equals: { display: 'Equals' },
    greaterThan: { display: 'Is Greater Than (>)' },
    lessThan: { display: 'Is Less Than (<)' },
  },
  bool: {
    is: { display: 'Is' },
  },
  date: {
    isBefore: { display: 'Is Before' },
    isAfter: { display: 'Is After' },
  },
  option: {
    is: { display: 'Is' },
    isNot: { display: 'Is Not' },
  },
};

// GENERATOR_TYPE='component';
