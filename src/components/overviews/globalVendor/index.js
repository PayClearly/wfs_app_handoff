import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...

import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  globalVendors: _try(() => Selectors.tableData.globalVendors(state), {}),
  globalVendorMetadata: state.global.metadata.data.items,
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_overviews_globalVendor extends Component {

  componentDidMount() { }

  componentWillUnmount() { }

  render() {
    const { globalVendorId, globalVendors, globalVendorMetadata } = this.props;
    const globalVendor = _try(() => globalVendors[globalVendorId], {});
    const metadata = globalVendorMetadata[globalVendorId];

    const { groupNames = null, accepts } = globalVendor;

    const notSetTag = (<i>Not set</i>);
    const website = _try(() => metadata.website) || notSetTag;
    const phoneNumber = _try(() => metadata.phoneNumber) || notSetTag;
    const streetAddress = _try(() => metadata.address.streetAddress) || '';
    const unit = _try(() => metadata.address.unit) || '';
    const city = _try(() => metadata.address.city) || '';
    const state = _try(() => metadata.address.state) || '';
    const zipCode = _try(() => metadata.address.zipCode) || '';
    const country = _try(() => metadata.address.country) || '';
    const address = `${streetAddress}${unit}${city}${state}${zipCode}${country}`.length ? `${streetAddress} ${unit} ${city} ${state} ${zipCode} ${country}` : notSetTag;
    const email = _try(() => metadata.email) || notSetTag;
    const contacts = _try(() => metadata.contacts) || notSetTag;

    return (
      <div className="components_overviews_globalVendor">
        <div className="row mb-2">
          <h3 className="mb-3"><span className="float-start me-3">{globalVendor.name}{groupNames && ` (${groupNames}) `}</span><Components.badges.acceptsmethod data={accepts} /></h3>
        </div>
        <div className="row mb-2">
          <div className="col-md-6 col-12">
            <strong>Street Address</strong>
            <br />
            <p className="text-muted">{address}</p>
          </div>
          <div className="col-md-3 col-12">
            <strong>Website</strong>
            <br />
            <p className="text-muted">{website}</p>
          </div>
          <div className="col-md-3 col-12">
            <strong>Phone Number</strong>
            <br />
            <p className="text-muted">{phoneNumber}</p>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 col-12">
            <strong>Email</strong>
            <br />
            <p className="text-muted">{email}</p>
          </div>
          <div className="col-md-3 col-12">
            <strong>Contacts</strong>
            <br />
            <p className="text-muted">{contacts}</p>
          </div>
        </div>
        <h3>Notification Settings</h3>
        <div className="row">
          <div className="col-md-6 col-12">
            <strong>Notify on Payment Creation</strong>
            <br />
            <p className="text-muted">{_try(() => Utils.capitalize(globalVendor.notifyOnCreation.toString())) || notSetTag}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>On Creation Delivery Emails</strong>
            <br />
            <p className="text-muted">{_try(() => globalVendor.notifyOnCreationEmails.join(', ')) || notSetTag}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Notify on Payment Completion</strong>
            <br />
            <p className="text-muted">{_try(() => Utils.capitalize(globalVendor.notifyOnCompletion.toString())) || notSetTag}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>On Completion Delivery Emails</strong>
            <br />
            <p className="text-muted">{_try(() => globalVendor.notifyOnCompletionEmails.join(', ')) || notSetTag}</p>
          </div>
        </div>
        {_try(() => globalVendor.notificationFields)
          && <Fragment>
            <h5>Notification Fields</h5>
            <div className="row">
              {Object.keys(globalVendor.notificationFields).map((key) => (
                <div className="col-md-4 col-12">
                  <strong>{key}</strong>
                  <br />
                  <p className="text-muted">{globalVendor.notificationFields[key] || notSetTag}</p>
                </div>
              ))}
            </div>
          </Fragment>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendor);


