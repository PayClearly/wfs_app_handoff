import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_components_resourceSelector_selectedCounter extends Component {

  clearSelection = () => {
    _try(() => this.props.form.action('change', this.props.form.fieldName, {}));
  }

  render() {
    const { forms, form, resourcesName } = this.props;
    const { formName, formKey, fieldName } = form;

    const selectedResources = _try(() => Object.keys(forms[formName][formKey][fieldName].value), []);
    const selectedCount = selectedResources.length;
    return (
      <div className="components_forms_components_resourceSelector_selectedCounter">
        <span className="text-primary me-2">{selectedCount} {resourcesName} selected</span>
        <span>|</span>
        <Components.button
          buttonText="Clear Selection"
          className="btn btn-secondary ms-2"
          onClick={this.clearSelection}
          disabled={!selectedCount}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_components_resourceSelector_selectedCounter);

