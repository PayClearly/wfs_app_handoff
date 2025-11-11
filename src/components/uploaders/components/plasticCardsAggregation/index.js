import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_uploaders_components_plasticCardsAggregation extends Component {

  state = {
    types: [{
      type: 'pCard',
      icon: 'credit-card-outline',
      text: 'Plastic Cards',
    }, {
      type: 'notReady',
      icon: 'alert-circle',
      text: 'Cards Not Ready',
    }, {
      type: 'total',
      icon: 'currency-usd',
      text: 'Total Cards',
    }],
  }




  render() {
    const { counts } = this.props.data;
    return (
      <div className="components_uploaders_components_plasticCardsAggregation">
        <div className="my-4">
          {
            this.state.types.map(({ type, icon, text }) => {
              if (!counts[type]) return null;
              return (
                <Fragment>
                  {type === 'total' && <hr className="my-1" />}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span>
                        <span className={`text-${type === 'notReady' ? 'danger' : 'primary'}`}>
                          <i className={`mdi mdi-${icon} pe-2`} />
                        </span>
                        <strong>{counts[type]}</strong> {text}:&nbsp;&nbsp;
                      </span>
                    </div>
                  </div>
                </Fragment>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_components_plasticCardsAggregation);


