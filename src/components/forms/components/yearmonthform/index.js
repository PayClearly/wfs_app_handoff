import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

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

class components_forms_components_yearmonthform extends Component {




  handleChange = (e) => {
    const { year, month } = e.target.form;
    this.props.onChange(new Date(year.value, month.value));
  };

  render() {
    const { date, localeUtils, fromMonth, toMonth } = this.props;

    const months = localeUtils.getMonths();

    const years = [];

    for (let i = fromMonth.getFullYear(); i <= toMonth.getFullYear(); i += 1) {
      years.push(i);
    }

    return (
      <form className="DayPicker-Caption">
        <div className="row">

          <div className="me-2">
            <select className="form-control-small" name="month" onChange={(e) => { return this.handleChange(e); }} value={date.getMonth()}>
              {months.map((month, i) => {
                return <option key={month} value={i}>{month}</option>;
              })}
            </select>
          </div>

          <div>
            <select className="form-control-small" name="year" onChange={this.handleChange} value={date.getFullYear()}>
              {years.map((year) => {
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_yearmonthform);


