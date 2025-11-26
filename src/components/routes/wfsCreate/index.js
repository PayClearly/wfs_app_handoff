import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    cardPolicies: Selectors.entity('cards_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_routes_wfsCreate extends Component {

  render() {
    const tabs = [
      <Components.tab name="orderPlasticCard" label="Order Plastic Card" iconClassName="mdi-playlist-edit" isValid={this.props.cardPolicies.canCreate}>
        <Components.creators.plastic forCreate />
      </Components.tab>,
    ];

    return (
      <Components.cardsroute>
        <Components.title />
        <Components.paymentsTabs
          loaded
          tabs={tabs}
        />
      </Components.cardsroute>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_wfsCreate);

