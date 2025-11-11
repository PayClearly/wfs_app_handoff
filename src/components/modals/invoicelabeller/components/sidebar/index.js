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

class components_modals_invoicelabeller_components_sidebar extends Component {




  render() {
    return (
      <div className="components_modals_invoicelabeller_components_sidebar">
        <Components.containers.image
          className="p-0 shadow-sm"
          alt="Invoice Thumbnail"
          thumbnail
          path={_try(() => this.props.invoice.attachment.storagePath)}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_invoicelabeller_components_sidebar);


