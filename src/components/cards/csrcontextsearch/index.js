import { connect, Component } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  organization: state.organization.data,
  organizations: state.organizations,
  account: state.account.data,
  accounts: state.accounts.data.items,
  adminAccounts: state.admin.accounts.data.item,
});

const mapDispatchToProps = (dispatch) => ({
  changeContext: (orgId, accountId) => {
    dispatch(Store.organization.sync(orgId, accountId));
  },
});

const escapeRegExp = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// eslint-disable-next-line camelcase
class components_cards_csrcontextsearch extends Component {
  state = {
    searchText: '',
    organizationExpanded: '',
  };

  handleSearch = (e) => {
    this.setState({ searchText: e.target.value });
  };

  changeContext = (orgId, accountId) => {
    this.setState({ searchText: '' }, this.props.changeContext(orgId, accountId));
  };

  render() {
    const {
      organizations, organization, account, adminAccounts,
    } = this.props;

    let orgsToDisplay = Object.keys(organizations.data.items)
      .filter((orgId) => adminAccounts[orgId] && organizations.data.items[orgId].active)
      .sort((orgA, orgB) => organizations.data.items[orgA].name
        .toLowerCase()
        .localeCompare(organizations.data.items[orgB].name.toLowerCase()));

    if (this.state.searchText) {
      const regex = new RegExp(escapeRegExp(this.state.searchText.toLowerCase()));
      orgsToDisplay = orgsToDisplay.filter((orgId) => {
        const matchFound = regex.test(this.props.organizations.data.items[orgId].name.toLowerCase());
        return matchFound;
      });
    }

    return (
      <div className="components_cards_csrcontextsearch">
        <div>
          <div className="pt-2 context-search pb-2">
            <div className="px-2">
              <h6>Search for Organization</h6>
              <input
                type="text"
                className="form-control small"
                onChange={this.handleSearch}
                value={this.state.searchText}
                placeholder="e.g. John Doe"
              />
            </div>
          </div>
        </div>
        <div className="px-2 my-2 items-scroll-container">
          {!Object.keys(adminAccounts).length
            ? <Components.spinner />
            : orgsToDisplay.map((orgId) => (
              <div className="my-3">
                <h4
                  className={`text-${this.state.organizationExpanded === orgId
                    ? 'primary'
                    : 'muted'} mb-1 organization-item`}
                  onClick={() => {
                    this.setState((prevState) => ({
                      organizationExpanded: prevState.organizationExpanded === orgId ? '' : orgId,
                    }));
                  }}
                >
                  <i className={`mdi mdi-chevron-${this.state.organizationExpanded === orgId ? 'down' : 'right'}`} />
                  {organizations.data.items[orgId].name}
                </h4>
                <Collapse isOpened={orgId === this.state.organizationExpanded}>
                  {(() => {
                    const accountsToDisplay = Object.keys(adminAccounts[orgId])
                      .filter((accountId) => adminAccounts[orgId][accountId].active).map((accountId) => (
                        <h5
                          className={`${account.id === accountId
                            ? 'selected'
                            : 'text-muted'} py-1 ps-4 m-0 account-item`}
                          onClick={() => {
                            if (organization.id === orgId && account.id === accountId) { return; }
                            this.changeContext(orgId, accountId);
                          }}
                        >
                          {adminAccounts[orgId][accountId].name}
                        </h5>
                      ));

                    return accountsToDisplay.length
                      ? accountsToDisplay
                      : <h5 className="m-0 ps-4 py-1 account-item text-muted disabled">No Active Accounts</h5>;
                  })()}
                </Collapse>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_csrcontextsearch);


