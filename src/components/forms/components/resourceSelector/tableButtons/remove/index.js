import { connect, Component } from 'component';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_forms_components_resourceSelector_tableButtons_remove extends Component {
  removeResource = (e) => {
    e.stopPropagation();
    const {
      id, forms, fieldName, formName, formKey, action,
    } = this.props;
    const field = _try(() => forms[formName][formKey][fieldName], {});
    const items = { ...field.value };

    delete items[id];
    action('change', fieldName, items);
  };

  render() {
    return (
      <div className="components_forms_components_resourceSelector_tableButtons_remove">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={(e) => { this.removeResource(e); }}
        >
          <i className="mdi mdi-delete pe-1" />
          Remove
        </button>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(components_forms_components_resourceSelector_tableButtons_remove);
