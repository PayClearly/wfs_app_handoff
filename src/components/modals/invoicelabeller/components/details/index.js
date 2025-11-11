import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_invoicelabeller_components_details extends Component {



  render() {
    return (
      <div className="components_modals_invoicelabeller_components_details">
        <Components.forms.invoicedetails initialFormData={this.props.invoice} formKey={this.props.invoice.id} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_invoicelabeller_components_details);


