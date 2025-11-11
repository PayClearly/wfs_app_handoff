import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...


import ovalLoader from 'assets/loaders/oval.svg';
import ovalLoaderWhite from 'assets/loaders/oval-white.svg';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_spinner extends Component {




  render() {
    return (
      <div className="components_spinner" style={{ height: '100%', margin: 'auto', 'text-align': 'center' }}>
        <span style={{ display: 'inline-block', verticalAlign: 'middle', height: '100%' }} />
        <svg width={this.props.height || '60'} height={this.props.height || '60'} viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
          <g className={`${this.props.white ? '' : 'color-container'}`} fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".25" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_spinner);


