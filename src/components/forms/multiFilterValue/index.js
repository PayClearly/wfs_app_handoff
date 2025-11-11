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
    param: state.router.route.params[props.filterId],
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

class components_forms_multiFilterValue extends Component {
  state = {
    name: 'Components.forms.multiFilterValue',
  }

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData,
      param,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({ key });


    const initialFormState = {
      filterValue: initialData !== null ? initialData.filterValue : (param || ''),
    };
    if (initialData === null && param && (param.includes('greaterThan') || param.includes('lessThan'))) {
      // filter condition discarded, it is handled elsewhere
      const filterValue = param.split('_').slice(1).join('_');
      initialFormState.filterValue = filterValue;
    }

    initialize(this.state.name, key, initialFormState);
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }

    if (this.props.initialFocus && !this.state.autoFocused && !this.inputRef) {
      setTimeout(() => {
        this.inputRef.focus();
        this.setState({ autoFocused: true });
      }, 1);
    } else if (this.props.initialFocus && !this.state.autoFocused && this.inputRef) {
      this.inputRef.focus();
      this.setState({ autoFocused: true });
    }
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
    if (e.keyCode === 13) {
      e.preventDefault();
      if (typeof this.props.handleEnterPress === 'function') this.props.handleEnterPress();
    }
  };

  setInputRef = (elem) => {
    this.inputRef = elem;
  }

  render() {
    const { filterDefinition } = this.props;
    const form = this.state.form;
    if (!form) return null;

    const filterType = filterDefinition.type;
    const label = filterDefinition.display;
    return (
      <form
        className="components_forms_multiFilterValue floating-labels form-group-noBottomMargin"
        onKeyUp={this.handleEnterPress}
        onSubmit={this.onSubmit}
      >
        <Fragment>
          {(filterType === 'string' || !filterType) &&
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="filterValue"
              action={this.standardFormAction}
              label={label}
              hideError={!form.filterValue.touched}
              setRef={this.setInputRef}
            />
          }
          {(filterType === 'number') &&
            <Components.forms.components.textinput
              form={form}
              type="number"
              field="filterValue"
              action={this.standardFormAction}
              label={label}
              hideError={!form.filterValue.touched}
              setRef={this.setInputRef}
            />
          }
          {(filterType === 'bool') &&
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="filterValue"
              action={this.standardFormAction}
              label={label}
              options={{
                true: {
                  display: _try(() => filterDefinition.valueDisplay || 'Yes'),
                },
                false: {
                  display: _try(() => filterDefinition.valueDisplay) ? `Not ${_try(() => filterDefinition.valueDisplay)}` : 'No',
                },
              }}
              hideError={!form.filterValue.touched}
              placeholder="Choose Value"
              setRef={this.setInputRef}
            />
          }
          {(filterType === 'option') &&
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="filterValue"
              action={this.standardFormAction}
              label={label}
              options={_try(() => filterDefinition.options, {})}
              hideError={!form.filterValue.touched}
              placeholder="Choose Value"
              setRef={this.setInputRef}
            />
          }
          {(filterType === 'date') &&
            <Components.forms.components.daypicker
              form={form}
              type="number"
              field="filterValue"
              action={this.standardFormAction}
              label={label}
              hideError={!form.filterValue.touched}
            />
          }
        </Fragment>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_multiFilterValue);


