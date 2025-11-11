import { connect, Component, Fragment } from 'component';
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
    dailySpendData: Selectors.dailySpend(state),
    providerStyles: state.appConfig.data.styles,
    darkMode: state.user.preferences.data.item.darkMode,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_widgets_dailyspendgraph extends Component {
  state = {
    dropdownIsOpen: false,
    months: [],
    currentMonth: '',
    fill1: '',
    fill2: '',
    fill3: '',
  };

  componentDidMount() {
    const dropdownMonths = getMonthsForDropdown();
    const fill1 = this.props.providerStyles[this.props.darkMode ? 'dark' : 'light']['--theme-bar1-color'] || '#137ED4';
    const fill2 = this.props.providerStyles[this.props.darkMode ? 'dark' : 'light']['--theme-bar2-color'] || '#22A2EB';
    const fill3 = this.props.providerStyles[this.props.darkMode ? 'dark' : 'light']['--theme-bar3-color'] || '#21C8DD';
    this.setState({
      dropdownIsOpen: false,
      currentMonth: dropdownMonths[0],
      months: dropdownMonths,
      fill1,
      fill2,
      fill3,
    });
  }

  componentWillUnmount() {}

  toggle = () => {
    this.setState(prevState => ({ dropdownIsOpen: !prevState.dropdownIsOpen }));
  };

  _onDropdownSelect = (value) => {
    this.setState({ currentMonth: value });
  };

  render() {
    const { dailySpendData } = this.props;
    const loaded = _try(() => dailySpendData);
    const toolTipFormatter = (value) => { return numeral(value).format('$0,0.00'); };
    const currentMonthIndex = this.state.months.findIndex((month) => { return month === this.state.currentMonth; });

    const showChart = loaded && dailySpendData && dailySpendData[currentMonthIndex] && dailySpendData[currentMonthIndex].some((item) => item.virtualCard || item.check || item.ach);
    const showNoPayments = loaded && !showChart;

    return (
      <div className="card components_widgets_dailyspendgraph">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h4 className="card-title">Payment Activity</h4>
            <Dropdown isOpen={this.state.dropdownIsOpen} toggle={this.toggle}>
              <DropdownToggle caret tag="div" className="daily-spend-dropdown" >
                {this.state.currentMonth}
              </DropdownToggle>
              <DropdownMenu>
                {this.state.months.map((month) => {
                  if (month === this.state.currentMonth) return false;
                  return <DropdownItem onClick={() => { this._onDropdownSelect(month); }} >{month}</DropdownItem>;
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
          <CSSTransition
            timeout={300}
            classNames="daily-spend-graph-transitioner"
            in={loaded}
          >
            <div>
              { showChart && (
                <ResponsiveContainer width={'100%'} height={350}>
                  <BarChart
                    data={dailySpendData[currentMonthIndex]}
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
                    <YAxis tickFormatter={value => numeral(value).format(`${value > 999999 ? '$0.0a' : (value > 100 ? '$0a' : '$0.00')}`)} />
                    <Tooltip formatter={toolTipFormatter} />
                    <Legend iconType={'circle'} verticalAlign={'top'} align={'right'} />
                    <Bar name="Virtual Card" dataKey="virtualCard" stackId="a" fill={this.state.fill1} />
                    <Bar dataKey="Check" stackId="a" fill={this.state.fill2} />
                    <Bar dataKey="ACH" stackId="a" fill={this.state.fill3} />
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
          {!loaded &&
            <div style={{ height: '350px' }}>
              <Components.horizontalLoader />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_dailyspendgraph);


