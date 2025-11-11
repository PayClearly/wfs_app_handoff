import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    form: _try(() => state.forms['Components.forms.accountVendorEnrollment'][Utils.getFormKey(props)], {}),
    types: state.validations.data.item,
    users: state.users.data.items,
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

class components_forms_accountVendorEnrollment extends Component {

  state = {
    name: 'Components.forms.accountVendorEnrollment',
  }

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    initialize(this.state.name, key, {
      status: initialData.status || 'pending',
      spendProjection: initialData.spendProjection || '',
      assignedTo: initialData.assignedTo || '',
      notes: initialData.notes || '',
    });
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), this.props.form._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, Utils.getFormKey(this.props));
  }

  onTypeAheadChange = (options, fieldName) => {
    const data = options[0] && options[0]._id;
    if (data) {
      this.props.change(this.state.name, Utils.getFormKey(this.props), fieldName, data);
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate);
    }
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = {};
      fields[field] = value;

      this.props[action](this.state.name, Utils.getFormKey(this.props), fields);
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate);
    } else {
      this.props[action](this.state.name, Utils.getFormKey(this.props), field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (values.notes && values.notes.length > 1000) {
      errors.notes = 'Maximum character limit exceeded (1000 character max)';
    }

    return errors;
  };

  render() {
    const { form, users } = this.props;
    if (!form._key) return null;

    return (
      <form className="components_forms_accountVendorEnrollment floating-labels">
        <div className="row">
          <div className="col-12 col-md">
            <Components.forms.components.selectinput
              form={form}
              field="status"
              action={this.standardFormAction}
              label="Status"
              options={{
                pending: { display: 'Pending' },
                inProgress: { display: 'In Progress' },
                attention: { display: 'Attention' },
                enrolled: { display: 'Enrolled' },
                declined: { display: 'Declined' },
              }}
              disabled={this.props.disabled}
              hideError={_try(() => !form.status.touched)}
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field="spendProjection"
              useNumberMask
              action={this.standardFormAction}
              label="Spend Projection"
              disabled={this.props.disabled}
              hideError={_try(() => !form.spendProjection.touched)}
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="assignedTo"
              action={() => { }}
              label="Assigned To"
              options={Object.values(users)}
              selected={_try(() => [users[form.assignedTo.value].label])}
              onTypeAheadChange={this.onTypeAheadChange}
              hideError={!form.assignedTo.touched}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textArea
              form={form}
              type="text"
              field="notes"
              action={this.standardFormAction}
              label="Enrollment Notes"
              disabled={this.props.disabled}
              maximumCharacters={1000}
            />
          </div>
        </div>
        {this.props.vendorId &&
          <div className="pb-3">
            <Components.overviews.accountVendorEnrollmentVendorDetails id={this.props.vendorId} />
          </div>
        }
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_accountVendorEnrollment);


