import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
  clientVendorLinksData: _resolve(state, 'account.clientVendorLinks.data.items', {}),
  clientsData: _resolve(state, 'account.clients.data.items', {}),
  clientsCollections: _resolve(state, 'account.clients.collections', {}),
  vendors: _resolve(state, 'account.accountVendors.data.items', {}),
  globalTaggedItems: Selectors.globalTaggedItems(state),
  defaultTag: _resolve(state, 'account.paymentPipelinePreferences.data.item.defalutGlobalVendorTagId'),
  standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_overviews_clientVendorLink extends Component {





  render() {
    const {
      id, clientId, vendorId, clientVendorLinksData, clientsData, clientsCollections, vendors, globalTaggedItems, defaultTag, standardCredentialFields,
    } = this.props;
    const clientVendorLink = _try(() => clientVendorLinksData[id], {});
    const client = clientsData[clientsCollections._ids[clientId][0]];
    const vendor = vendors[vendorId];

    let credentialSchema;
    const globalVendorId = vendor.globalVendorRef;
    if (globalVendorId && defaultTag) {
      credentialSchema = _try(() => globalTaggedItems.vendors[globalVendorId].tags[defaultTag].vCard.credentialSchema.fields);
    }

    const notSetTag = (<i>Not set</i>);

    const clientDisplay = client.display || notSetTag;
    const vendorDisplay = vendor.display || notSetTag;
    const credentials = clientVendorLink.credentials || {};

    return (
      <div className="components_overviews_clientVendorLink">
        <div className="row">
          <div className="col-md col-12">
            <strong>Client</strong>
            <br />
            <p className="text-muted">{clientDisplay}</p>
          </div>
          <div className="col-md col-12">
            <strong>Vendor</strong>
            <br />
            <p className="text-muted">{vendorDisplay}</p>
          </div>
        </div>
        {!!credentialSchema
          && <Fragment>
            <h4>Credentials</h4>
            <div className="row">
              {Object.values(credentialSchema).map((field) => (
                <div className="col-md-4 col-xs-6">
                  <strong>{_try(() => standardCredentialFields[field.key].name, field.key)}</strong>
                  <br />
                  {credentials[field.key]
                    && <p className="text-muted">
                      {credentials[field.key]}
                    </p>}
                  {!credentials[field.key] && field.required
                    && <p className="text-muted">
                      <i className="mdi mdi-alert-circle-outline text-danger" />
                    </p>}
                  {!credentials[field.key] && !field.required
                    && <p className="text-muted">
                      {notSetTag}
                    </p>}
                </div>
              ))}
            </div>
          </Fragment>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_clientVendorLink);


