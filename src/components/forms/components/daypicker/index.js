import {
  connect,
  Component,
} from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch, props) => ({});

class components_forms_components_daypicker extends Component {
  state = {
    isFocused: false,
  };





  /**
   * `date` comes from {@link DayPickerInput} as the client's timezone
   * at 12:00 PM. This can cause bugs downstream if you don't manage the
   * dates correctly.
   */
  handleDayChange = (date) => {
    this.props.action('change', this.props.field, date);
  };

  formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  render() {
    const { form, field: fieldName, dateRange } = this.props;
    const field = form[this.props.field];

    const currentYear = new Date().getFullYear();

    /*
    dateRange is an optional prop that limits the range of selectable dates
    { min: <Date>, max: <Date }
    selectable dates will default as (<Current Date> - 20 years) to (<Current Date> + 20 years)
    */
    const maxYear = (dateRange && dateRange.max) ? dateRange.max.getFullYear() : currentYear + 20;
    const minYear = (dateRange && dateRange.min) ? dateRange.min.getFullYear() : currentYear - 20;

    const fromMonth = new Date(minYear, 0);
    const toMonth = new Date(maxYear, 11);

    const disabledDays = (dateRange)
      ? { before: dateRange.min, after: dateRange.max }
      : {};

    if (!field) {
      return <span />;
    }

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;

    const selectedDays = (this.props.UTC && field.value)
      ? new Date(field.value.getUTCFullYear(), field.value.getUTCMonth(), field.value.getUTCDate())
      : field.value;

    return (
      <div
        className={
          classNames(
            'components_forms_components_daypicker',
            { focused: field.focused },
            'form-group',
            { 'has-error': (field.error && !this.props.hideError) }
          )
        }
        // Hacktacular solution to prevent focus event from eating click events when overlay form is opened
        onClick={(!this.state.isFocused)
          ? () => {
            if (!this.props.disabled) {
              this.setState({ isFocused: true }, () => {
                this.props.action('focus', fieldName);
              });
            }
          }
          : null}
        role="none"
      >
        <DayPickerInput
          type={this.props.type}
          formatDate={this.props.formatDate || this.formatDate}
          id={id}
          onDayChange={this.handleDayChange}
          onDayPickerHide={(date) => {
            this.setState({ isFocused: false }, () => {
              this.props.action('blur', fieldName);
            });
          }}
          inputProps={{
            readOnly: true,
            style: { cursor: 'pointer' },
            className: classNames(
              'input-sm',
              'form-control',
              'w-100',
              !this.props.disabled && 'readOnlyOverwrite',
              { disabled: this.props.disabled }
            ),
            disabled: this.props.disabled,
          }}
          placeholder={this.props.placeholder || 'MM-DD-YYY'}
          value={field.value}
          disabled={this.props.disabled || false}
          dayPickerProps={{
            selectedDays,
            month: Utils.dates.isValidDate(field.value) ? field.value : new Date(Date.now()),
            fromMonth,
            toMonth,
            disabledDays,
            captionElement: ({ date, localeUtils }) => (
              <Components.forms.components.yearmonthform
                date={date}
                fromMonth={fromMonth}
                toMonth={toMonth}
                localeUtils={localeUtils}
                onChange={this.handleDayChange}
              />
            ),
          }}
        />
        <span className="bar" />
        {
          this.props.label
          && (
            <label
              className={classNames('mb-2', { required: this.props.required, isFloating: Boolean(field.value) })}
              htmlFor={id}
            >
              {this.props.label}
            </label>
          )
        }
        <span
          className={classNames('day-picker-icon-container', { disabled: this.props.disabled })}
          style={{ pointerEvents: 'none' }}
        >
          <i className="day-picker-icon mdi mdi-calendar" />
        </span>
        <small className="fieldError text-danger bottom-left">
          {(field.error && !this.props.hideError) ? field.error : '\u00A0'}
        </small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_daypicker);


