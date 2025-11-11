import { connect, Component, Fragment } from 'component';
import { ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
import numeral from 'numeral';
import Selectors from 'selectors';
import Components from 'components';

import { getMonthsForDropdown } from '../helpers';
import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    vendorSpendData: Selectors.spendByVendor(state),
    providerStyles: state.appConfig.data.styles,
    darkMode: state.user.preferences.data.item.darkMode,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_widgets_spendbyvendorpiechart extends Component {

  state = {
    dropdownIsOpen: false,
    months: [''],
    currentMonth: '',
    activeIndex: 0,
  };

  componentDidMount() {
    const dropdownMonths = getMonthsForDropdown();
    const fill1 = this.props.providerStyles[this.props.darkMode ? 'dark' : 'light']['--theme-bar1-color'] || false;
    const fill2 = this.props.providerStyles[this.props.darkMode ? 'dark' : 'light']['--theme-bar2-color'] || false;
    const fill3 = this.props.providerStyles[this.props.darkMode ? 'dark' : 'light']['--theme-bar3-color'] || false;

    if (fill1 && fill2 && fill3) {
      this.setState({ COLORS: [fill1, hexGradient(fill1, 20), hexGradient(fill1, 40), fill2, hexGradient(fill2, 20), hexGradient(fill3, -20), fill3] });
    } else this.setState({ COLORS: ['#028ee1', '#137ED4', '#21C8DD', '#22A2EB', '#05AEDD', '#01c0c8', '#8884d8'] });

    this.setState({
      dropdownIsOpen: false,
      currentMonth: dropdownMonths[0],
      months: dropdownMonths,
    });
  }

  componentWillReceiveProps() {}

  componentWillUnmount() {}

  toggle = () => {
    this.setState((prevState) => {
      return { dropdownIsOpen: !prevState.dropdownIsOpen };
    });
  }

  _onDropdownSelect = (value) => {
    this.setState({ currentMonth: value, activeIndex: 0 });
  }

  _onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index,
    });
  }

  renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey - 9} textAnchor={textAnchor} fill="#333">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={9}textAnchor={textAnchor} fill="#333">{numeral(value).format('$0,0.00')}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={27} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  render() {
    const { vendorSpendData } = this.props;
    const loaded = !!vendorSpendData;
    const currentMonthIndex = this.state.months.findIndex((month) => month === this.state.currentMonth);

    const showPieChart = loaded && this.state.COLORS && vendorSpendData && vendorSpendData[currentMonthIndex] && vendorSpendData[currentMonthIndex].length != 0;
    const noDataToShow = loaded && !showPieChart;

    return (
      <div className="card components_widgets_spendbyvendorpiechart">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h4 className="card-title">Payment Activity by Vendor</h4>
            <Dropdown isOpen={this.state.dropdownIsOpen} toggle={this.toggle}>
              <DropdownToggle caret tag="div" className="vendor-spend-dropdown">
                {this.state.currentMonth}
              </DropdownToggle>
              <DropdownMenu>
                {this.state.months.map((month) => {
                  if (month === this.state.currentMonth) return false;
                  return <DropdownItem onClick={() => { this._onDropdownSelect(month); }}>{month}</DropdownItem>;
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
          <CSSTransition
            timeout={300}
            classNames="spend-by-vendor-pie-chart-transitioner"
            in={loaded}
          >
            <div>
              { showPieChart && (
                <ResponsiveContainer width={'100%'} height={350}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      activeIndex={this.state.activeIndex}
                      activeShape={this.renderActiveShape}
                      data={vendorSpendData[currentMonthIndex]}
                      outerRadius={100}
                      fill="#8884d8"
                      onMouseEnter={this._onPieEnter}
                      onClick={this._onPieEnter}
                      animationDuration={500}
                    >
                      {
                        vendorSpendData[currentMonthIndex].map((entry, index) => { return <Cell fill={this.state.COLORS[index % this.state.COLORS.length]} />; })
                      }
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              { noDataToShow && (
                <div className="alert alert-info" role="alert">
                  <h4 className="alert-heading">No Payments</h4>
                  You do not have any payments for this month. When you fund a payment, it will appear in the chart.
                </div>
              )}
            </div>
          </CSSTransition>
          {!loaded &&
            <div style={{ height: '80px' }}>
              <Components.horizontalLoader />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_spendbyvendorpiechart);

function hexGradient(color, gradient) {
  // Get rid of #
  color = color.slice(1);
  // Get hex values of r, g, b
  let [r, g, b] = color.match(/.{2}/g);
  // Get r, b, g values and offset
  [r, g, b] = [parseInt(r, 16) + gradient, parseInt(g, 16) + gradient, parseInt(b, 16) + gradient];
  // make sure it fits constraints
  r = Math.max(Math.min(255, r), 0).toString(16);
  g = Math.max(Math.min(255, g), 0).toString(16);
  b = Math.max(Math.min(255, b), 0).toString(16);

  const rr = (r.length < 2 ? '0' : '') + r;
  const gg = (g.length < 2 ? '0' : '') + g;
  const bb = (b.length < 2 ? '0' : '') + b;

  return `#${rr}${gg}${bb}`;
}
