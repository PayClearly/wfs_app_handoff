import { connect, Component, bindActionCreators, Fragment } from 'component';
import classNames from 'classnames';

import logoMastercard from 'assets/logos/mastercard-logo.png';

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

class components_virtualcard_mastercard extends Component {

  render() {
    const { card, blur, logo, nameOnCard, overlay } = this.props;

    const cardfactor = this.props.factor || 1.2;

    return (
      <div
        tabIndex="0"
        className="components_virtualcard_mastercard"
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

            {!blur ?
              <Components.clicktocopytextwrapper onCopy={this.props.copierOnCopy} showTooltip={this.props.showCopierTooltip} value={card.cardNumber} >
                <div
                  className={classNames(blur && 'blur-text')}
                  style={{
                    position: 'absolute',
                    top: `${60 * cardfactor}px`,
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
                  top: `${60 * cardfactor}px`,
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
                top: `${90 * cardfactor}px`,
                left: `${15 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${10 * cardfactor}px`,
                fontSize: `${6 * cardfactor}px`,
                fontWeight: 700,
              }}
            >
              MONTH/YEAR
            </div>
            <div
              className={classNames(blur && 'blur-text')}
              style={{
                position: 'absolute',
                top: `${95 * cardfactor}px`,
                left: `${15 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${30 * cardfactor}px`,
                fontSize: `${15 * cardfactor}px`,
                fontWeight: 600,
                fontFamily: 'kredit',
              }}
            >
              {card.expires || ''}
            </div>
            <div
              style={{
                position: 'absolute',
                top: `${90 * cardfactor}px`,
                left: `${80 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${10 * cardfactor}px`,
                fontSize: `${6 * cardfactor}px`,
                fontWeight: 700,
              }}
            >
              POSTAL CODE
            </div>
            {!blur ?
              <Components.clicktocopytextwrapper onCopy={this.props.copierOnCopy} showTooltip={this.props.showCopierTooltip} value={card.postalCode} >
                <div
                  className={classNames(blur && 'blur-text')}
                  style={{
                    position: 'absolute',
                    top: `${95 * cardfactor}px`,
                    left: `${80 * cardfactor}px`,
                    width: `${60 * cardfactor}px`,
                    height: `${30 * cardfactor}px`,
                    fontSize: `${15 * cardfactor}px`,
                    fontWeight: 600,
                    fontFamily: 'kredit',
                  }}
                >
                  {card.postalCode}
                </div>
              </Components.clicktocopytextwrapper>
              :
              <div
                className={classNames(blur && 'blur-text')}
                style={{
                  position: 'absolute',
                  top: `${95 * cardfactor}px`,
                  left: `${80 * cardfactor}px`,
                  width: `${60 * cardfactor}px`,
                  height: `${30 * cardfactor}px`,
                  fontSize: `${15 * cardfactor}px`,
                  fontWeight: 600,
                  fontFamily: 'kredit',
                }}
              >
                {card.postalCode}
              </div>
            }
            <div
              style={{
                position: 'absolute',
                top: `${90 * cardfactor}px`,
                left: `${190 * cardfactor}px`,
                width: `${60 * cardfactor}px`,
                height: `${10 * cardfactor}px`,
                fontSize: `${6 * cardfactor}px`,
                fontWeight: 700,
              }}
            >
              CVV
            </div>
            {!blur ?
              <Components.clicktocopytextwrapper onCopy={this.props.copierOnCopy} showTooltip={this.props.showCopierTooltip} value={card.cardcvv} >
                <div
                  className={classNames(blur && 'blur-text')}
                  style={{
                    position: 'absolute',
                    top: `${95 * cardfactor}px`,
                    left: `${190 * cardfactor}px`,
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
                  top: `${95 * cardfactor}px`,
                  left: `${190 * cardfactor}px`,
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
              className={classNames(blur && 'blur-text')}
              style={{
                position: 'absolute',
                top: `${125 * cardfactor}px`,
                left: `${15 * cardfactor}px`,
                width: `${160 * cardfactor}px`,
                height: `${30 * cardfactor}px`,
                fontSize: `${15 * cardfactor}px`,
                fontWeight: 600,
                fontFamily: 'kredit',
              }}
            >
              {nameOnCard}
            </div>
            <div
              style={{
                position: 'absolute',
                top: `${120 * cardfactor}px`,
                right: `${10 * cardfactor}px`,
                width: `${35 * cardfactor}px`,
                height: `${35 * cardfactor}px`,
              }}
            >
              <img
                alt="logo"
                style={{
                  maxHeight: `${35 * cardfactor}px`,
                  maxWidth: `${35 * cardfactor}px`,
                }}
                src={logoMastercard}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_virtualcard_mastercard);

