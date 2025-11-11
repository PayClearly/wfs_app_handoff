import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

class components_overviews_address extends Component {





  render() {
    if (!this.props) { return <div />; }

    const address = this.props.address || {};
    const { clickToCopy } = this.props;
    return (
      <div className="row">
        {clickToCopy
          ? <Fragment>
            <div className="col-12 mb-0">
              <Components.clicktocopytextwrapper
                value={address.streetAddress || ''}
                showTooltip
              >
                <p className="mb-0">{address.streetAddress || ''} {address.unit && `unit ${address.unit}`}</p>
              </Components.clicktocopytextwrapper>
            </div>
            <div className="col-12">
              <Components.clicktocopytextwrapper
                value={address.city || ''}
                showTooltip
              >
                <p>{address.city || ''}, {address.state || ''} {address.zipCode || ''}</p>
              </Components.clicktocopytextwrapper>
            </div>
          </Fragment>
          : <Fragment>

            <div className="col-12 mb-0">
              <p className="mb-0">{address.streetAddress || ''} {address.unit && `unit ${address.unit}`}</p>
            </div>
            <div className="col-12">
              <p>{address.city || ''}, {address.state || ''} {address.zipCode || ''}</p>
            </div>
          </Fragment>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_address);


