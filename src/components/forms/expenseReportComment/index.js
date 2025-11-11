import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

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

class components_forms_expenseReportComment extends Component {

  state = {
    name: 'Components.forms.expenseReportComment',
  }

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    initialize(this.state.name, key, {
      memo: initialData.memo || '',
    });
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    return errors;
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

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form
        className="components_forms_expenseReportComment floating-labels form-group-noBottomMargin"
        onKeyUp={this.handleEnterPress}
        onSubmit={this.onSubmit}
      >
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="memo"
              action={this.standardFormAction}
              label={!this.props.hideLabel && 'Comment'}
              fieldPlaceholder="Write a comment..."
              disabled={this.props.disabled}
              hideError={!form.memo.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_expenseReportComment);


