import { connect, Component } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';
import {
  REPORT_TYPES,
} from '../../reports/constants';

import './index.scss';

const mapStateToProps = (state) => ({
    forms: state.forms,
  });


const mapDispatchToProps = { ...Store.forms };

class components_routes_createreport extends Component {

  render() {
    const reportType = _try(() => this.props.forms['Components.forms.createreport'].default._values.reportType, '');

    return (
      <div className={'components_routes_createreport floating-labels'}>
        <Components.forms.createreport />
        { reportType === 'transactionDetails'
          && <Components.reports.transactions />}
        { reportType === 'spendByVendor'
          && <Components.reports.spendbyvendor />}
        { reportType === 'spendByCard'
          && <Components.reports.spendByCard />}
        { reportType === 'recon'
          && <Components.reports.recon />}
        {/* comdata file output format */}
        { reportType === 'ac28'
          && <Components.reports.ac28 />}
        {/* comdata file output format */}
        { reportType === 'ac29'
          && <Components.reports.ac29 />}
        {/* wex file output format */}
        { reportType === 'vapCleared'
          && <Components.reports.vapCleared />}
        { reportType === 'pctrAch'
          && <Components.reports.pctr pctrType="pctrAch" />}
        { reportType === 'pctrCheck'
          && <Components.reports.pctr pctrType="pctrCheck" />}
        { reportType === 'pctrCard'
          && <Components.reports.pctr pctrType="pctrCard" />}
        { reportType === REPORT_TYPES.CHECK_ACTIVITY
          && <Components.reports.checkActivity />}
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(components_routes_createreport);

// GENERATOR_TYPE='component';
