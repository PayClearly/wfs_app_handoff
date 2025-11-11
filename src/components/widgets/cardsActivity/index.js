import { connect, Component } from 'component';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import numeral from 'numeral';
import Selectors from 'selectors';
import Components from 'components';

import { getMonthsForDropdown } from '../helpers';
import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    dailyCardsActivity: _try(() => Selectors.dailyCardsActivity(state), {}),
    integration: _try(() => Selectors.integrations(state).cardsIntegration),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_widgets_cardsActivity extends Component {

  state = {
    dropdownIsOpen: false,
    months: [],
    currentMonth: '',
  };

  componentDidMount() {
    const dropdownMonths = getMonthsForDropdown();
    this.setState({
      months: dropdownMonths,
      currentMonth: dropdownMonths[0],
    });
  }

  componentWillUnmount() {}

  toggle = () => this.setState(prevState => ({ dropdownIsOpen: !prevState.dropdownIsOpen }));

  _onDropdownSelect = value => this.setState({ currentMonth: value });

  render() {
    const { dailyCardsActivity, integration } = this.props;
    const { cardsActivityByMonth } = dailyCardsActivity;
    const formatDollars = value => numeral(value).format('$0,0.00');
    const currentMonthIndex = this.state.months.findIndex(month => (month === this.state.currentMonth));
    const loaded = !integration.loading && cardsActivityByMonth && Object.keys(cardsActivityByMonth).length;

    const showChart = loaded && cardsActivityByMonth[currentMonthIndex] && cardsActivityByMonth[currentMonthIndex].some(item => item.clears || item.auths);
    const showNoPayments = loaded && !showChart;

    return (
      <div className="card components_widgets_cardsActivity">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h4 className="card-title">Cards Activity</h4>
            <Dropdown isOpen={this.state.dropdownIsOpen} toggle={this.toggle}>
              <DropdownToggle caret tag="div" className="daily-spend-dropdown" >
                {this.state.currentMonth}
              </DropdownToggle>
              <DropdownMenu>
                {this.state.months.map((month) => {
                  if (month === this.state.currentMonth) return false;
                  return <DropdownItem onClick={() => this._onDropdownSelect(month)}>{month}</DropdownItem>;
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
          {
            !integration.loading && integration.notLinked && (
              <div className="alert alert-info" role="alert">
                <h4 className="alert-heading">No Cards Integration</h4>
                There is no Cards Integration provider linked with this account.
              </div>
            )
          }
          <CSSTransition
            timeout={600}
            classNames="cards-activity-widget-transitioner"
            in={loaded}
          >
            <div>
              { showChart && (
                <ResponsiveContainer width={'100%'} height={350} >
                  <BarChart
                    data={cardsActivityByMonth[currentMonthIndex]}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      minTickGap={50}
                      tickFormatter={(value) => {
                        const dateComponents = _try(() => value.split('/'));
                        return _try(() => `${dateComponents[0]}/${dateComponents[1]}`, value);
                      }}
                    />
                    <YAxis tickFormatter={_yAxisTickFormatter} />
                    <Tooltip formatter={formatDollars} />
                    <Legend iconType="circle" verticalAlign="top" align="right" />
                    <Bar name="Cleared" dataKey="clears" stackId="a" fill="#105BA2" />
                    <Bar name="Authorized" dataKey="auths" stackId="a" fill="#21C8DD" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              { showNoPayments && (
                <div className="alert alert-info" role="alert">
                  <h4 className="alert-heading">No Payments</h4>
                  You do not have any payments for this month. When you fund a payment, it will appear in the chart.
                </div>
              )}
            </div>
          </CSSTransition>

          { !loaded && (
            <div style={{ height: '350px' }}><Components.horizontalLoader /></div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_widgets_cardsActivity);


const _yAxisTickFormatter = (value) => {
  if (value > 999999) return numeral(value).format('$0.0a');
  else if (value > 100) return numeral(value).format('$0a');
  else if (value < 0) return numeral(value).format('($0a)');
  return numeral(value).format('$0.00');
};
