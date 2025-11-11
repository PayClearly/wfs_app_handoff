import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    account: state.account.data,
    accounts: state.accounts,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    changeAccount: (id) => {
      dispatch(Store.account.sync(id));
    },
  });
};

class components_accountcontext extends Component {

  state = {
    account: {},
    accPopover: false,
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const account = nextProps.accounts.data.items[nextProps.account.id] || {};

    this.setState({
      account,
      accounts: nextProps.accounts.data.items || {},
    });
  }

  accountClicked(id) {
    this.props.changeAccount(id);
  }



  render() {
    const loading = !this.props.account.id || !this.state.accounts;
    if (loading) {
      return <div />;
    }

    const selectableAccountOptions = Object.keys(this.state.accounts)
      .filter((accountId) => {
        if (accountId === this.props.account.id) return true;
        return this.state.accounts[accountId].active;
      })
      .reduce((activeAccounts, accountId) => {
        const toReturn = { ...activeAccounts };
        toReturn[accountId] = this.state.accounts[accountId];
        return toReturn;
      }, {});

    const selectedAccountName = selectableAccountOptions[this.props.account.id] && selectableAccountOptions[this.props.account.id].name;
    const multipleAccounts = Object.keys(selectableAccountOptions).length > 1;

    return (
      <nav className="components_accountcontext" aria-label="breadcrumb">
        <ol className="breadcrumb p-0 mb-0">
          <li style={{ position: 'relative' }}>
            <span
              style={{ cursor: multipleAccounts ? 'pointer' : 'default', fontWeight: 700 }}
            >
              {selectedAccountName || '--'}
              {(selectedAccountName && multipleAccounts)
                &&
                <select
                  className="form-control w-100 h-100 overlayedSelect"
                  value={selectedAccountName.trim()}
                  onChange={(e) => {
                    const value = Object.keys(selectableAccountOptions)
                      .find((key) => {
                        return selectableAccountOptions[key].name.trim() === e.target.value;
                      });
                    this.accountClicked(value);
                  }}
                >
                  {
                    Object.keys(selectableAccountOptions)
                      .sort((accountA, accountB) => {
                        return selectableAccountOptions[accountA].name.toLowerCase().localeCompare(selectableAccountOptions[accountB].name.toLowerCase());
                      })
                      .map((key) => {
                        return (
                          <option>{selectableAccountOptions[key].name}</option>
                        );
                      })
                  }
                </select>
              }
              {multipleAccounts && <i className="mdi mdi-menu-down" />}
            </span>
          </li>
        </ol>
      </nav>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_accountcontext);


