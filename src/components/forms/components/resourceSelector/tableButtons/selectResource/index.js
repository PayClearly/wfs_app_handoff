import { connect, Component, bindActionCreators, Fragment } from 'component';

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

class components_forms_components_resourceSelector_tableButtons_selectResource extends Component {

  //   console.log(currentlyInScope);
  //   Object.keys(currentlyInScope || {})
  //     .forEach((id) => {
  //         items[id] = true;

  _toggleSingleEditedItem = (e) => {
    const { forms, fieldName, formName, formKey, action } = this.props;
    const field = _try(() => forms[formName][formKey][fieldName]);
    const { id } = e.currentTarget;

    const items = { ...field.value };
    if (items[id]) {
      delete items[id];
    } else {
      items[id] = true;
    }
    action('change', fieldName, items);
  }

  render() {
    const { id, forms, formName, formKey, fieldName } = this.props;
    const selectedResources = _try(() => forms[formName][formKey][fieldName].value, {});

    return (
      <input
        key={id}
        type="checkbox"
        style={{ margin: '.8rem' }}
        id={id}
        onChange={this._toggleSingleEditedItem}
        value={selectedResources[id]}
        checked={selectedResources[id]}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_components_resourceSelector_tableButtons_selectResource);

