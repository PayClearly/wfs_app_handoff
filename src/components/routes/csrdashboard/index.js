import { connect, Component, Fragment } from 'component';

import Components from 'components';
import './index.scss';

const mapStateToProps = (state) => ({
  adminAccounts: state.admin.accounts.data.item,
});
const mapDispatchToProps = () => ({});

class components_routes_csrdashboard extends Component {
  render() {
    if (!Object.keys(this.props.adminAccounts).length) { return <Components.spinner />; }
    return (
      <Fragment>
        <div className="row mb-4">
          <div style={{ position: 'relative' }} className="col-12">
            <Components.cards.csraccountstatuses />
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-12 col-md-12 col-xl-12 order-1 order-md-2 mb-3 mb-md-0">
            <Components.cards.csraccountdetails />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_csrdashboard);
