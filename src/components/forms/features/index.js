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
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
  });
};

class components_forms_features extends Component {

  state = {
    name: 'Components.forms.features',
    openAccordions: {}
  }

  componentDidMount() {
    const { initialize, validate, format, features } = this.props;
    const formKey = this.props.formKey || 'default';

    const initialData = Object.keys(format || {}).reduce((acc, key) => {
      format[key].forEach(({ value }) => {
        if (!acc[value]) acc[value] = features[value] || 'OFF';
      });
      return acc;
    }, {});

    initialize(this.state.name, formKey, initialData);
    validate(this.state.name, formKey, this.validate);

    // initial state so properties are mapped to state
    const accordianNames = {};
    Object.keys(this.props.format).forEach((category) => {
      accordianNames[category] = false;
    });
    this.setState({ key: formKey, openAccordions: accordianNames });
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };
  validate = (fields) => {
    const errors = {};

    Object.keys(fields).forEach((field) => {
      if (!fields[field]) errors[field] = 'This field is required';
    });

    return errors;
  }

  toggleAccordion = (category) => {
    this.setState(prevState => ({
      openAccordions: {
        ...prevState.openAccordions,
        [category]: prevState.openAccordions.hasOwnProperty(category)
          ? !prevState.openAccordions[category]
          : prevState.openAccordions[category]
      },
    }));
  };

  render() {
    const borderStyle = { borderTop: 'solid 1px rgb(220, 220, 220)', margin: '0rem 1.45rem 1.45rem 1.45rem', paddingTop: '1rem' };

    const LineItem = ({ item, form, index }) => {
      return (
        <div style={index > 0 ? borderStyle : { margin: '0rem 1.45rem 1.45rem 1.45rem' }}>
          <h4 style={{ margin: 'auto' }}>{item.display}</h4>
          <div className="row">
            <div className="col-md-4">
              <Components.forms.components.radio
                hideError
                action={this.props.display ? undefined : this.standardFormAction} label={'OFF'}
                form={form}
                field={item.value}
                value="OFF" />
            </div>
            <div className="col-md-4">
              <Components.forms.components.radio action={this.props.display ? undefined : this.standardFormAction} label={'ON'} form={form} field={item.value} value="ON" />
            </div>
            <div className="col-md-4">
              <Components.forms.components.radio hideError action={this.props.display ? undefined : this.standardFormAction} label={'CSR'} form={form} field={item.value} value="CSR" />
            </div>
          </div>
        </div>
      );
    };
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) return null;

    return (
      <div className="components_forms_features">
        <h3>Edit Feature Flags</h3>
        {Object.keys(this.props.format).map(category => (
          <Components.boxaccordion
            label={category}
            leftAligned
            selected={!!this.state.openAccordions[category]}
            onSelect={() => this.toggleAccordion(category)}
          >
            {this.props.format[category].map((item, i) => (
              <LineItem form={form} item={item} index={i} />
            ))}
          </Components.boxaccordion>
        ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_features);
