import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';



const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_revenueshareoverview extends Component {

  componentDidMount() {}
  componentWillUnmount() {}

  renderBinData(name, data) {
    const binData = typeof data === 'string'
      ? { 0: data }
      : data;
  
    return (
      <Fragment>
        <div className="row">
          <div className="col">
            <h3>{name} Tiers</h3>
          </div>
        </div>
        <div className="row align-items-start">
          {Object.keys(binData).map((tierData, i) => {
            if (i === 0) {
              return (
                <div className="col-3">
                  <p className="text-muted"><strong> - Base Rate+ <i style={{ fontSize: '24px' }} className={'mdi mdi-trending-up'} /> </strong>{_decimalToPercentage(binData[tierData])}</p>
                </div>
              );
            }
            return (
              <div className="col-3">
                <p className="text-muted">
                  <strong>{`${numeral(tierData).format('$0,0')}`}+ <i style={{ fontSize: '24px' }} className={'mdi mdi-trending-up'} /> </strong>{_decimalToPercentage(binData[tierData])}
                </p>
              </div>
            );
          })}
        </div>
      </Fragment>
    );
  }

  render() {
    const { revenueShare } = this.props;

    // TODO: Surface _createdAt ? Helpful? Would allow revenueShares to be sorted by most recently created
    const { binTypes } = revenueShare;

    return (
      <Fragment>
        {Object.keys(binTypes).map((binType) => {
          let name;
          switch (binType) {
            case 'MCGC': {
              name = 'Ghost Card';
              break;
            }
            case 'MCVC': {
              name = 'Virtual Card';
              break;
            }
            case 'MCP':
            default: {
              name = 'Plastic';
              break;
            }
          }
          return this.renderBinData(name, binTypes[binType]);
        })}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_revenueshareoverview);

// Internal Helper Functions ... 
function _decimalToPercentage(num) {
  return `${Number(parseFloat(num * 100).toFixed(2))} %`;
}

