import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    orgs: state.organizations.data.items,
    accs: state.accounts.data.items,
    currentOrg: state.organization.data.id,
    currentAcc: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    changeContext: (orgId, accId) => {
      dispatch(Store.organization.sync(orgId, accId));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_widgets_ftpAccountAttentionBanner extends Component {





  render() {
    const { organization, account, orgs, accs } = this.props;
    const orgName = _try(() => orgs[organization].name);
    const accName = _try(() => accs[account].name);

    return (
      <div className="components_widgets_ftpAccountAttentionBanner" style={{ marginBottom: '1rem' }}>
        <div className={`body w-100 card ${organization === this.props.currentOrg && account === this.props.currentAcc ? 'selected' : ''}`} style={{ padding: '.5rem', cursor: 'pointer' }} onClick={() => this.props.changeContext(organization, account)}>
          <div style={{ display: 'flex', whiteSpace: 'pre' }}>
            <h5 className={`mb-0${organization === this.props.currentOrg && account === this.props.currentAcc ? ' text-primary' : ''}`}>{orgName}&nbsp;</h5>
            <h5 className={`mb-0${organization === this.props.currentOrg && account === this.props.currentAcc ? ' text-primary' : 'text-muted'}`}>/ {accName || account}&nbsp;</h5>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_widgets_ftpAccountAttentionBanner);


