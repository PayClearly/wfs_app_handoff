import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_receipts extends Component {




  renderCards = () => {
    return this.props.attachments.map((attachment, index) => {
      return (
        <div className={`col-12 ${this.props.columnClass}`}>
          <div className="row">
            <div className="col-12">
              <div className="card d-flex justify-content-center align-items-center" style={{ minHeight: '75px' }}>
                {this.props.handleDownload && <button style={{ position: 'absolute', top: 5, right: 5, zIndex: 5 }} className="btn btn-primary" onClick={() => { this.props.handleDownload(attachment); }} ><i className="mdi mdi-download" /></button>}
                {this.props.removeReceipt && this.props.canAdministrateGlobalVendors && <button disabled={this.props.removing} style={{ position: 'absolute', top: 5, left: 5, zIndex: 5 }} className={`btn btn-danger${this.props.removing ? ' disabled' : ''}`} onClick={() => { this.props.removeReceipt(index); }} ><i className="mdi mdi-delete" /></button>}
                {(() => {
                  if (attachment.contentType.includes('image')) {
                    return (
                      <Components.containers.image
                        alt={`attachment ${attachment.originalname}`}
                        path={attachment.storagePath}
                        thumbnail={false}
                        hash={attachment.md5Hash}
                      />
                    );
                  }
                  if (attachment.contentType.includes('pdf')) {
                    return (
                      <Components.containers.pdf
                        pdf={attachment}
                      />
                    );
                  }
                  return (
                    <Components.mimeicon
                      contentType={attachment.contentType}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    return (
      <div className="row components_overviews_receipts">
        {this.renderCards()}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_receipts);


