import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    organization: state.organization.data,
    organizations: state.organizations,
    opsDashboard: state.router.baseUrl.includes('/ops'),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    changeOrganization: (id) => {
      dispatch(Store.organization.sync(id));
    },
  });
};

class components_organizationcontext extends Component {

  state = {
    organization: {},
    orgPopover: false,
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }
  componentWillReceiveProps(nextProps) {
    const organization = nextProps.organizations.data.items[nextProps.organization.id] || {};
    this.setState({
      organization,
      organizations: nextProps.organizations.data.items || {},
    });
  }


  organizationClicked(id) {
    this.props.changeOrganization(id);
  }

  render() {
    const loading = !this.props.organization.id && !this.props.opsDashboard || !this.state.organizations;
    if (loading) {
      return <div className="p-4"><Components.horizontalLoader /></div>;
    }

    const selectableOrganizationOptions = Object.keys(this.state.organizations)
      .filter((organizationId) => {
        if (organizationId === this.props.organization.id) return true;
        return this.state.organizations[organizationId].active;
      })
      .reduce((activeOrganizations, organizationId) => {
        const toReturn = { ...activeOrganizations };
        toReturn[organizationId] = this.state.organizations[organizationId];
        return toReturn;
      }, {});

    const selectedOrganization = selectableOrganizationOptions[this.props.organization.id] || {};
    const multipleOrganizations = Object.keys(selectableOrganizationOptions).length > 1;

    return (
      <div className="breadcrumb components_organizationcontext m-0 p-4">
        <div className="position-relative text-uppercase small bold">
          <span>{selectedOrganization.name || 'select an organization'}</span>
          {multipleOrganizations
            &&
            <Fragment>
              <select
                className="form-control w-100 h-100 overlayedSelect"
                value={selectedOrganization.name || ''}
                onChange={(e) => {
                  const value = Object.keys(selectableOrganizationOptions)
                    .find((key) => {
                      return selectableOrganizationOptions[key].name.trim() === e.target.value;
                    });
                  this.organizationClicked(value);
                }}
              >
                {
                  Object.values(selectableOrganizationOptions)
                    .sort((orgA, orgB) => {
                      return orgA.name.toLowerCase().localeCompare(orgB.name.toLowerCase());
                    })
                    .map((organization) => {
                      return (
                        <option>{organization.name}</option>
                      );
                    })
                }
              </select>
              <i className="mdi mdi-menu-down" />
            </Fragment>
          }
        </div>
      </div>
    );

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_organizationcontext);


