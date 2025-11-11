import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    refs: _try(() => props.refPath.split('|').reduce((acc, curr) => { return { ...acc, ...Utils.deepdotproperty(state, curr || '') } }, null)),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_referenceinput extends Component {

  state = {
    loading: true,
    internalValue: null,
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }
  componentWillReceiveProps(newProps = {}) {
    const { refKey = 'name', refs, field, form } = newProps;

    let matchedId = _try(() => Object.keys(refs).find(id => id === form._values[field]), null);
    if (!matchedId) matchedId = _try(() => Object.keys(refs).find(id => refs[id][refKey] === form._values[field]), null);

    // should only check if it was touched if this.props.preferences.allowBatchERPOverride is false
    if (matchedId && /*!_try(() => form[field].touched) &&*/ !this.state.internalValue && _try(() => refs[matchedId][refKey])) {
      this.setState({ internalValue: _try(() => refs[matchedId][refKey]) });
    }

    if (this.state.loading) this.setState({ loading: false });
  }


  actionIntercepter(type, fieldName, value) {
    const { refKey = 'name', refs } = this.props;

    const matchedId = _try(() => Object.keys(refs).find(id => refs[id][refKey] === value), null);

    if (value) this.setState({ internalValue: value });
    this.props.action(type, fieldName, matchedId || null);
  }

  render() {
    const { form, field, label, refKey = 'name', disabled, overRidden, hideError, required, refs } = this.props;
    const isDisabled = disabled || overRidden;

    // We need to make sure we've checked if the id/value matches one of the resources in our system before rendering the input field
    if (!form || !form[field] || !refs || this.state.loading) {
      return (<span />);
    }

    const _form = {
      _values: {
        ...form._values[field],
        [field]: this.state.internalValue || '',
      },
      [field]: {
        ...form[field],
        value: this.state.internalValue || '',
      },
    };

    return (
      <Components.forms.components.typeahead
        form={_form}
        field={field}
        overRidden={overRidden}
        action={(type, fieldName, value) => { this.actionIntercepter(type, fieldName, value); }}
        label={label}
        options={Object.values(refs)}
        labelKey={refKey}
        hideError={hideError}
        disabled={isDisabled}
        required={required}
        noItemsText={this.props.noItemsText}
        noItemsClicked={(e) => {
          if (this.props.noItemsClicked) this.props.noItemsClicked(e, this.state.internalValue);
        }}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_referenceinput);


