import { connect, Component, bindActionCreators, Fragment } from 'component';
import classNames from 'classnames';
import logoVisa from 'assets/logos/Visa_Logo.png';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    providerThemePhone: Selectors.providerTheme(state).supportPhone,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_virtualcard_visa extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { card, blur, logo, overlay } = this.props;
    const cardfactor = this.props.factor || 1.2;

    return (
      <div
        tabIndex="0"
        className="components_virtualcard_visa"
        style={{ minWidth: `${257 * cardfactor}px` }}
      >
        {overlay &&
          <div className="overlay" />
        }
        <div
          className="one-edge-shadow"
          style={{
            width: `${257 * cardfactor}px`,
            height: `${162 * cardfactor}px`,
            backgroundColor: 'white',
            borderRadius: `${10 * cardfactor}px`,
            borderColor: '#E9ECEF',
            borderStyle: 'solid',
            borderWidth: '0.05em',
          }}
        >
          <div
            style={{
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${10 * cardfactor}px`,
                left: `${10 * cardfactor}px`,
                width: `${120 * cardfactor}px`,
                height: `${40 * cardfactor}px`,
              }}
            >
              <img
                alt="logo"
                style={{
                  maxHeight: `${40 * cardfactor}px`,
                  maxWidth: `${120 * cardfactor}px`,
                }}
                src={logo}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                top: `${15 * cardfactor}px`,
                right: `${10 * cardfactor}px`,
                width: `${80 * cardfactor}px`,
                height: `${45 * cardfactor}px`,
                fontSize: `${10 * cardfactor}px`,
              }}
            >
              Virtual Account
            </div>
            <div
              style={{
                position: 'absolute',
                top: `${51.5 * cardfactor}px`,
                left: `${15 * cardfactor}px`,
                width: `${300 * cardfactor}px`,
                height: `${25 * cardfactor}px`,
                fontSize: `${10 * cardfactor}px`,
              }}
            >
              Customer Service # 1-{this.props.providerThemePhone}
            </div>
            <div
              style={{
                position: 'absolute',
                top: `${68 * cardfactor}px`,
                left: `${15 * cardfactor}px`,
                width: `${300 * cardfactor}px`,
                height: `${25 * cardfactor}px`,
                fontSize: `${8 * cardfactor}px`,
                fontWeight: 700,
              }}
            >
              Account Number
            </div>
            {!blur ?
              <Components.clicktocopytextwrapper onCopy={this.props.copierOnCopy} showTooltip={this.props.showCopierTooltip} value={card.cardNumber} >
                <div
                  className={classNames(blur && 'blur-text')}
                  style={{
                    position: 'absolute',
                    top: `${75 * cardfactor}px`,
                    left: `${15 * cardfactor}px`,
                    width: `${300 * cardfactor}px`,
                    height: `${25 * cardfactor}px`,
                    fontSize: `${22 * cardfactor}px`,
                    fontFamily: 'kredit',
                    fontWeight: 600,
                  }}
                >
                  {card.maskedNumber || ''}
                </div>
              </Components.clicktocopytextwrapper>
              :
              <div
                className={classNames(blur && 'blur-text')}
                style={{
                  position: 'absolute',
                  top: `${75 * cardfactor}px`,
                  left: `${15 * cardfactor}px`,
                  width: `${227 * cardfactor}px`,
                  height: `${25 * cardfactor}px`,
                  fontSize: `${22 * cardfactor}px`,
                  fontFamily: 'kredit',
                  fontWeight: 600,
                }}
              >
                {card.maskedNumber || ''}
              </div>
            }
            <div
              style={{
                position: 'absolute',
                top: `${103 * cardfactor}px`,
                left: `${15 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${10 * cardfactor}px`,
                fontSize: `${7 * cardfactor}px`,
                fontWeight: 700,
              }}
            >
              CVV2
            </div>
            {!blur ?
              <Components.clicktocopytextwrapper onCopy={this.props.copierOnCopy} showTooltip={this.props.showCopierTooltip} value={card.cardcvv} >
                <div
                  className={classNames(blur && 'blur-text')}
                  style={{
                    position: 'absolute',
                    top: `${112 * cardfactor}px`,
                    left: `${15 * cardfactor}px`,
                    width: `${60 * cardfactor}px`,
                    height: `${30 * cardfactor}px`,
                    fontSize: `${15 * cardfactor}px`,
                    fontWeight: 600,
                    fontFamily: 'kredit',
                  }}
                >
                  {card.cardcvv}
                </div>
              </Components.clicktocopytextwrapper>
              :
              <div
                className={classNames(blur && 'blur-text')}
                style={{
                  position: 'absolute',
                  top: `${112 * cardfactor}px`,
                  left: `${15 * cardfactor}px`,
                  width: `${60 * cardfactor}px`,
                  height: `${30 * cardfactor}px`,
                  fontSize: `${15 * cardfactor}px`,
                  fontWeight: 600,
                  fontFamily: 'kredit',
                }}
              >
                {card.cardcvv}
              </div>
            }
            <div
              style={{
                position: 'absolute',
                top: `${103 * cardfactor}px`,
                left: `${75 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${10 * cardfactor}px`,
                fontSize: `${7 * cardfactor}px`,
                fontWeight: 700,
              }}
            >
              MONTH/YEAR
            </div>
            <div
              className={classNames(blur && 'blur-text')}
              style={{
                position: 'absolute',
                top: `${112 * cardfactor}px`,
                left: `${75 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${30 * cardfactor}px`,
                fontSize: `${15 * cardfactor}px`,
                fontWeight: 600,
                fontFamily: 'kredit',
              }}
            >
              {card.expires || ''}
            </div>
            {
              <div
                style={{
                  position: 'absolute',
                  top: `${135 * cardfactor}px`,
                  left: `${15 * cardfactor}px`,
                  width: `${300 * cardfactor}px`,
                  height: `${25 * cardfactor}px`,
                  fontSize: `${10 * cardfactor}px`,
                }}
              >
                Limited Use
              </div>
            }
            <div
              style={{
                position: 'absolute',
                top: `${130 * cardfactor}px`,
                right: `${15 * cardfactor}px`,
                width: `${42 * cardfactor}px`,
                height: `${42 * cardfactor}px`,
              }}
            >
              <img
                alt="logo"
                style={{
                  maxHeight: `${42 * cardfactor}px`,
                  maxWidth: `${42 * cardfactor}px`,
                }}
                src={logoVisa}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_virtualcard_visa);


