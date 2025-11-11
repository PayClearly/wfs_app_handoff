import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import { cannedFields } from 'components/forms/components/customreportfield/reportFields';
import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = { ...Store.forms };


class components_forms_components_customreportfield extends Component {
  state = {
    name: 'Components.forms.customreportfields',
    selected: false,
    fieldNameOptions: {},
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      fieldName,
      selected,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    const fieldDictionary = cannedFields.reduce(((acc, cur) => {
      acc[cur.name] = { ...cur };
      return acc;
    }), {});

    const fieldNameOptions = cannedFields;

    initialize(this.state.name, key, {
      fieldName: fieldName || '',
      selected,
    });
    validate(this.state.name, key, this.validate);

    this.setState({ fieldNameOptions, fieldDictionary });
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const form = nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key];
    this.setState({ form, key });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onDelete = (e) => {
    e.stopPropagation();
    this.props.handleDelete(this.props.index);
    this.props.destroy(this.state.name, this.state.key);
  };

  onMove = (e, direction) => {
    e.stopPropagation();
    this.props.handleMove(this.props.index, direction);
  };

  onAddField = (e) => {
    e.stopPropagation();
    this.props.handleAddField(this.props.index);
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  validate = (values = {}) => {
    const errors = {};
    // if (values.fieldName.includes(',')) {
    if (values.fieldName && values.fieldName.includes(',')) {
      errors.fieldName = 'Commas are not allowed.';
    }

    return errors;
  };

  render() {
    const { form, fieldNameOptions, key, fieldDictionary } = this.state;
    const { disabled, index, isLast } = this.props;
    if (!form) return null;

    const fieldType = fieldDictionary[key] ? fieldDictionary[key].type : '';
    const fieldLength = fieldDictionary[key] ? fieldDictionary[key].length : '';
    const fieldDescription = fieldDictionary[key] ? fieldDictionary[key].description : '';
    return (
      <div className="components_forms_components_customreportfield row align-items-center px-3 floating-labels">
        <div className="col-1 d-flex flex-column justify-content-center align-items-center">
          {
            !disabled &&
            <Fragment>
              <button className="btn btn-tertiary small up" disabled={index === 0} onClick={e => this.onMove(e, 'up')}>
                <i className={'mdi mdi-arrow-up'} />
              </button>
              <p className="mb-0">{index}</p>
              <button className="btn btn-tertiary small down" disabled={isLast} onClick={e => this.onMove(e, 'down')}>
                <i className={'mdi mdi-arrow-down'} />
              </button>
            </Fragment>
          }
        </div>
        <div className="col-9 pt-2" style={{ height: '70px' }}>
          <Components.forms.components.textinput
            form={form}
            type="text"
            field="fieldName"
            action={this.standardFormAction}
            disabled={disabled}
            label={key}
            hideError
            detailedInformation={fieldDescription}
            truncate
          />
        </div>
        <div className="col-2 text-center">
          {
            disabled
              ? <button className="btn-circle btn btn-outline-primary d-none d-md-block small float-end" onClick={this.onAddField}>
                <i className="mdi mdi-arrow-right" />
              </button>
              : <button className="btn-circle btn btn-outline-danger d-none d-md-block small float-end" onClick={this.onDelete}>
                <i className="mdi mdi-close" />
              </button>
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_customreportfield);


