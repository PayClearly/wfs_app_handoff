import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_integrationIssuesDetails extends Component {




  render() {
    return (
      <div className="components_modals_integrationIssuesDetails modal-dialog wide-modal wide-80">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Integration {this.props.issueType}</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.containers.integrationIssuesWrapper integration={this.props.integration} issueType={this.props.issueType} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_integrationIssuesDetails);


