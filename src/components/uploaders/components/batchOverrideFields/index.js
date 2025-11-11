import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    erpIntegration: _try(() => Selectors.integrations(state).erpIntegration, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_uploaders_components_batchOverrideFields extends Component {




  render() {

    if (!this.props.erpIntegration.linked) return null;

    return (
      <div className="components_uploaders_components_batchOverrideFields">
        <span>
          <strong style={{ paddingTop: '1rem' }}>{'ERP Override Fields'}</strong>
          <Components.tooltip className="d-inline">
            <i className="mdi mdi-help-circle-outline" />
            <div>These values will overwrite your default ERP settings for this entire batch of payments when records are created in your ERP</div>
          </Components.tooltip>
          <strong>:</strong>
        </span>
        <Components.forms.erpFields
          hideTypeAheads={false}
          formKey={'erpFields-override'}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_uploaders_components_batchOverrideFields);


