import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    account: state.account,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_cards_integrationOverviewContainer extends Component {

  render() {
    const integrations = Object.keys(this.props.account || {}).filter(key => key.toLowerCase().includes('integration'));
    integrations.sort((a, b) => Object.keys(this.props.account[b].data.details).length - Object.keys(this.props.account[a].data.details).length);

    return (
      <div className="components_cards_integrationOverviewContainer card w-100">
        {integrations.map((integration, i) => (
          <Components.widgets.integrationoverview integration={integration} last={i === integrations.length - 1} />
        ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_integrationOverviewContainer);

