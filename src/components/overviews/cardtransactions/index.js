import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';



const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_cardtransactions extends Component {




  render() {
    const { data } = this.props;
    return (
      <div className="row">
        {data.reason ?
          (<div className="col-12 col-md-4">
            <strong>Reason</strong>
            <br />
            <p className="text-muted">{data.reason}</p>
          </div>) : null
        }
        {data.clearingReferenceNumber ?
          (<div className="col-12 col-md-4">
            <strong>Clearing Reference #</strong>
            <br />
            <p className="text-muted">{data.clearingReferenceNumber}</p>
          </div>) : null
        }
        {data.authCode ?
          (<div className="col-12 col-md-4">
            <strong>Authorization Code</strong>
            <br />
            <p className="text-muted">{data.authCode}</p>
          </div>) : null
        }
        {data.previousAuthCode ?
          (<div className="col-12 col-md-4">
            <strong>Previous Authorization Code</strong>
            <br />
            <p className="text-muted">{data.previousAuthCode}</p>
          </div>) : null
        }
        {data.transactionType ?
          (<div className="col-12 col-md-4">
            <strong>Authorization Type</strong>
            <br />
            <p className="text-muted">{data.transactionType === 'info' ? 'Advice' : data.transactionType}</p>
          </div>) : null
        }
        {data.amount !== null && data.amount !== undefined ?
          (<div className="col-12 col-md-4">
            <strong>Amount</strong>
            <br />
            <p className="text-muted">{numeral(data.amount).format('$0,0.00')}</p>
          </div>) : null
        }
        {data.merchantName || data.merchantCity || data.merchantState || data.merchantMCC ?
          (<div className="col">
            <strong>Merchant</strong>
            <br />
            <p className="text-muted">{data.merchantName}, {data.merchantCity}, {data.merchantState}{'\n'}{data.merchantMCC} (MCC)</p>
          </div>) : null
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_cardtransactions);


