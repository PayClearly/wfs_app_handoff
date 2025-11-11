import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
// import { Menu, MenuItem } from 'react-bootstrap-typeahead';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    tags: state.global.tags.data.items,
    globalVendors: state.global.vendors.data.items,
    groups: state.global.groups.data.items,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_globalVendorGroup extends Component {

  state = {
    name: 'Components.forms.globalVendorGroup',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
      globalVendors,
    } = this.props;

    const key = this.props.formKey ? this.props.formKey : 'default';

    const globalVendorIds = Object.keys(globalVendors).filter(id => globalVendors[id].groupIds && globalVendors[id].groupIds.includes(initialData._id));

    initialize(this.state.name, key, {
      name: initialData.name || '',
      active: initialData.active ? !!initialData.active : true,
      tagIds: _try(() => initialData.tagIds.length) ? initialData.tagIds : [],
      tags: '',
      globalVendorIds,
      globalVendors: '',
    });

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

  onTypeAheadChange = (options) => {
    const data = options.length ? options.map(option => option._id) : [];
    this.props.change(this.state.name, this.state.key, 'tagIds', data);
    this.props.validate(this.state.name, this.state.key, this.validate);
  };

  onGlobalVendorTypeAheadChange = (options) => {
    const data = options.length ? options.map(option => option._id) : [];
    this.props.change(this.state.name, this.state.key, 'globalVendorIds', data);
    this.props.validate(this.state.name, this.state.key, this.validate);
  };

  checkForConflicts = (vendorIds = [], tagIds = []) => {
    const { initialData = {}, globalVendors, groups } = this.props;
    let conflict = false;
    let clash = false;
    const groupId = initialData._id || '';

    const byVendorMap = vendorIds.reduce((acc, vendorId) => {
      const globalGroups = globalVendors[vendorId].groupIds;
      if (globalGroups) {
        globalGroups.forEach((group) => {
          const tags = groups[group].tagIds || [];
          acc[vendorId] = acc[vendorId] || {};
          acc[vendorId][group] = [...tags];
        });

      }
      return acc;
    }, {});

    vendorIds.forEach((vendorId) => {
      const vendorGroups = byVendorMap[vendorId] || {};
      Object.keys(vendorGroups).forEach((vendorGroup) => {
        tagIds.forEach((tag) => {
          if (vendorGroups[vendorGroup].includes(tag) && vendorGroup !== groupId) {
            conflict = true;
            clash = {
              vendorId,
              tagId: tag,
              groupId: vendorGroup,
            };
          }
        });
      });
    });

    return { conflict, clash };
  }

  validate = (values) => {
    const { tags, globalVendors, groups } = this.props;
    const groupType = this.props.types.GlobalVendorGroup.properties;
    const errors = {};

    if (!this.checkType(groupType.name, values.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!values.name) {
      errors.name = 'Group name is required';
    }

    const { conflict, clash } = this.checkForConflicts(values.globalVendorIds, values.tagIds);

    if (conflict) {
      const message = `This group has a vendor${_try(() => globalVendors[clash.vendorId].name) ? ` (${globalVendors[clash.vendorId].name})` : ''} that already has ${_try(() => tags[clash.tagId].name) || 'one of these tags'} associated with it via${_try(() => groups[clash.groupId].name) ? ` the group "${groups[clash.groupId].name}"` : ' another group'}`;
      errors.tags = message;
      errors.globalVendors = message;
    }

    return errors;
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_globalVendorGroup pt-2">
        <div className="row">
          <div className="col-xs-12 col-md-10">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Group Name"
              disabled={this.props.disabled}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.switch
              form={form}
              field="active"
              action={this.standardFormAction}
              label="Active"
              disabled={this.props.disabled}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="tags"
              action={() => { }}
              disabled={this.props.disabled}
              selected={form.tagIds.value.map(val => this.props.tags[val]).filter(item => item)}
              multiple
              options={Object.values(this.props.tags) || {}}
              labelKey="name"
              onTypeAheadChange={this.onTypeAheadChange}
              label="Tags"
              noItemsText="Not Found"
              floatLabel={Boolean(form.tagIds.value.length)}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="globalVendors"
              action={() => { }}
              disabled={this.props.disabled}
              selected={form.globalVendorIds.value.map(val => this.props.globalVendors[val]).filter(item => item)}
              multiple
              options={Object.values(this.props.globalVendors) || {}}
              labelKey="name"
              onTypeAheadChange={this.onGlobalVendorTypeAheadChange}
              label="Global Vendors"
              noItemsText="Not Found"
              floatLabel={Boolean(form.globalVendorIds.value.length)}
              hasClearAll
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorGroup);


