import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    globalVendorGroups: _try(() => Selectors.tableData.globalVendorGroups(state), {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_globalVendorGroup extends Component {




  _generatePSOPIcons = () => {
    const { globalVendorGroups, id } = this.props;
    const group = globalVendorGroups[id];
    const { vCard, ACH, check } = group;

    return (
      <span style={{ fontSize: '28px' }}>
        <Components.badges.psopIcon
          method="vCard"
          accepts={_try(() => vCard.accepts)}
          groupId={group._id}
          classNames="float-start pe-2"
        />
        <Components.badges.psopIcon
          method="ACH"
          accepts={_try(() => ACH.accepts)}
          groupId={group._id}
          classNames="float-start pe-2"
        />
        <Components.badges.psopIcon
          method="check"
          accepts={_try(() => check.accepts)}
          groupId={group._id}
          classNames="float-start pe-2"
        />
      </span>
    );
  };

  render() {
    const { globalVendorGroups, id } = this.props;
    const group = globalVendorGroups[id];
    const { tagNames, globalVendorNames: globalVendors } = group;
    const notSetTag = (<i>Not set</i>);

    return (
      <div className="components_overviews_globalVendorGroup">
        <div className="row mb-2">
          <h3 className="mb-3"><span className="float-start ms-3 me-3">{group.name}</span>{this._generatePSOPIcons()}</h3>
        </div>
        <div className="row mb-2">
          <div className="col-12">
            <strong>Tags</strong>
            <br />
            <p className="text-muted">{tagNames || notSetTag}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-12">
            <strong>Global Vendors</strong>
            <br />
            <p className="text-muted">
              {globalVendors}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorGroup);


