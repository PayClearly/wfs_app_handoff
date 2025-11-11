import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_uploaders_components_paymentcardsaggregation extends Component {

  state = {
    types: [{
      type: 'vCard',
      icon: 'credit-card-outline',
      text: 'Purchase Cards',
    }, {
      type: 'notReady',
      icon: 'alert-circle',
      text: 'Cards Not Ready',
    }, {
      type: 'total',
      icon: 'currency-usd',
      text: 'Total Value',
    }],
  }




  render() {
    const { counts, amounts } = this.props.data;
    return (
      <div className="components_uploaders_components_paymentcardsaggregation">
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
                    <div>
                      <strong>{numeral(amounts[type].total || amounts[type]).format('$0,0.00')}</strong>
                    </div>
                  </div>
                  {Boolean(_try(() => amounts[type].fee)) &&
                    <div className="ms-4 ps-2 mb-2" style={{ borderLeft: '1px solid rgba(0, 0, 0, 0.1)' }}>
                      <div>
                        <span>Net:&nbsp;&nbsp;{numeral(amounts[type].net).format('$0,0.00')}</span>
                      </div>
                      <div>
                        <span>Service Fees:&nbsp;&nbsp;{numeral(amounts[type].fee).format('$0,0.00')}</span>
                      </div>
                    </div>
                  }
                </Fragment>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_components_paymentcardsaggregation);


