import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  groups: state.global.groups.data.items,
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_modals_psop extends Component {

  componentDidMount() {
    const { method } = this.props;

    if (method !== 'check' && method !== 'vCard' && method !== 'ACH') {
      this.props.close();
    }
  }

  componentWillUnmount() { }

  render() {
    const { method, groupId, groups } = this.props;
    const group = groups[groupId];

    const hasProcedure = Boolean(_try(() => group[method].procedure));

    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content h-100 w-100 components_modals_psop">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              ({group.name}) - {method} PSOP
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <Components.tabs>
              <Components.tab name="psop" label="Fields and Fees" iconClassName="mdi-rhombus-split">
                <Components.entities.globalVendorGroupPSOP
                  method={method}
                  groupId={groupId}
                />
              </Components.tab>
              <Components.tab name="workflow" label="Workflow" iconClassName="mdi-format-list-checks">
                {!hasProcedure
                  && <Fragment>
                    <div className="alert alert-info" role="alert">
                      <h4 className="alert-heading">No Workflow</h4>
                      This group does not have a {method} workflow yet. Please create one below to start PSOP creation.
                    </div>
                    <Components.creators.globalVendorProcedure
                      groupId={groupId}
                      method={method}
                      noAccordion
                    />
                  </Fragment>}
                {hasProcedure
                  && <Components.entities.globalVendorProcedure
                    groupId={groupId}
                    method={method}
                    procedureId={group[method].procedure}
                  />}
              </Components.tab>
            </Components.tabs>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { this.props.close(); }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_psop);


