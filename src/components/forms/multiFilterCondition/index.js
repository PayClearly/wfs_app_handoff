import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';


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

class components_forms_multiFilterCondition extends Component {
  state = {
    name: 'Components.forms.multiFilterCondition',
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

    const options = Object.keys(this.props.conditionOptions || {}).map((optionKey) => {
      return {
        value: optionKey,
        iconClass: this.props.conditionOptions[optionKey].icon,
        display: this.props.conditionOptions[optionKey].display,
      };
    });

    const defaultValue = _try(() => options[0].value, '');
    const initialFormState = {
      filterCondition: _try(() => initialData.filterCondition) || defaultValue,
    };

    if (initialData === null && param && (param.includes('greaterThan') || param.includes('lessThan'))) {
      // filter value discarded, it is handled elsewhere
      const filterCondition = param.split('_')[0];
      initialFormState.filterCondition = filterCondition;
    }

    initialize(this.state.name, key, initialFormState);
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
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

  render() {
    const form = this.state.form;
    if (!form) return null;

    const options = Object.keys(this.props.conditionOptions || {}).map((optionKey) => {
      return {
        value: optionKey,
        iconClass: this.props.conditionOptions[optionKey].icon,
        display: this.props.conditionOptions[optionKey].display,
      };
    });

    return (
      <form
        className="components_forms_multiFilterCondition"
      >
        <Components.forms.components.radioButtonGroup
          form={form}
          field="filterCondition"
          action={this.standardFormAction}
          options={options}
        />
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_multiFilterCondition);


