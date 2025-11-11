import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...
import clearlyLogo from 'assets/logos/clearly-logo.png';
import bancorpLogo from 'assets/logos/bancorp.png';
import logoWex from 'assets/logos/wex-logo.png';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  accountName: _try(() => state.accounts.data.items[state.account.data.id].name),
  showAccountNameOnCards: state.account.paymentPipelinePreferences.data.showAccountNameOnCards,
  appLogo: state.appConfig.data.logo,
  accountVCardLogo: _try(() => state.accounts.data.items[state.account.data.id].virtualCardLogo),
  provider: _try(() => state.account.cardsIntegration.data.details.provider),
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_virtualcard extends Component {





  logoOptions = {
    wex: logoWex,
    bancorp: bancorpLogo,
    appLogo: this.props.appLogo || clearlyLogo,
  };

  render() {
    const logo = _getCardLogo(this.props, this.logoOptions);
    const cardfactor = this.props.factor || 1.2;
    const blur = this.props.loading || this.props.blur;
    const showCopierTooltip = this.props.showCopierTooltip || false;
    const privateCardData = (!blur && this.props.privateCardData && { ...this.props.privateCardData }) || {
      cardNumber: '3532382327239884',
      cardExpirationMonth: '11',
      cardExpirationYear: '2020',
      cardcvv: '3984',
      postalCode: '89493',
    };

    privateCardData.maskedNumber = privateCardData.cardNumber && _maskCardNumber(privateCardData.cardNumber);
    privateCardData.expires = `${privateCardData.cardExpirationMonth}/${privateCardData.cardExpirationYear && privateCardData.cardExpirationYear.slice(2, 4)}`;

    const nameOnCard = (this.props.showAccountNameOnCards && this.props.accountName)
      || (this.props.createdBy && this.props.createdBy.firstName && this.props.createdBy.lastName
        && `${this.props.createdBy.firstName} ${this.props.createdBy.lastName}`)
      || this.props.accountName;

    return (
      <div
        className="components_virtualcard"
        onClick={() => this.props.onClick && this.props.onClick()}
        role="tooltip"
      >
        {(this.props.cardType || '').toLowerCase() === 'visa'
          ? (
            <Components.virtualcard.visa
              card={privateCardData}
              logo={logo}
              blur={blur}
              copierOnCopy={this.props.copierOnCopy}
              factor={cardfactor}
              showCopierTooltip={showCopierTooltip}
              nameOnCard={nameOnCard}
              overlay={!!this.props.onClick}
            />
          )
          : (
            <Components.virtualcard.mastercard
              factor={cardfactor}
              card={privateCardData}
              logo={logo}
              blur={blur}
              copierOnCopy={this.props.copierOnCopy}
              nameOnCard={nameOnCard}
              showCopierTooltip={showCopierTooltip}
              overlay={!!this.props.onClick}
            />
          )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_virtualcard);

// Internal Helper Functions ...
function _maskCardNumber(cardNumber) {
  const arr = cardNumber.split('');
  arr.splice(12, 0, ' ');
  arr.splice(8, 0, ' ');
  arr.splice(4, 0, ' ');
  return arr.join('');
}

function _getCardLogo(props, logoOptions = {}) {
  if (props.accountVCardLogo) { return props.accountVCardLogo; }

  const cardType = props.cardType && props.cardType.toLowerCase();

  switch (cardType) {
    case 'visa': {
      return logoOptions.bancorp;
    }
    case 'mastercard': {
      return logoOptions.wex;
    }
    default: return logoOptions.appLogo;
  }

}

