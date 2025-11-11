import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import { Menu, MenuItem } from 'react-bootstrap-typeahead';


import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    status: state.statements.status,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_createstatement extends Component {

  state = {
    name: 'Components.forms.createstatement',
    key: 'default',
    monthOptions: {
      0: {
        display: 'Jan',
      },
      1: {
        display: 'Feb',
      },
      2: {
        display: 'Mar',
      },
      3: {
        display: 'Apr',
      },
      4: {
        display: 'May',
      },
      5: {
        display: 'Jun',
      },
      6: {
        display: 'Jul',
      },
      7: {
        display: 'Aug',
      },
      8: {
        display: 'Sep',
      },
      9: {
        display: 'Oct',
      },
      10: {
        display: 'Nov',
      },
      11: {
        display: 'Dec',
      },
    },
    fileTypeOptions: {
      pdf: {
        display: 'PDF',
      },
      xlsx: {
        display: 'XLSX',
      },
    },
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = this.props.revenueShareId;
    const statementFields = Utils.getStatementFields();

    this.setState({ key }, () => {
      const initialFields = statementFields.initialValues.join(',');
      initialize(this.state.name, this.state.key, {
        fields: initialFields,
        month: '',
        year: '',
        fileType: '',
      });

      this.generateOptions();
      validate(this.state.name, this.state.key, this.validate);
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][this.state.key],
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onStatementFieldsChanged = (value) => {
    return this.props.change(this.state.name, this.state.key, 'fields', value.join(','));
  };

  validate = (fields) => {
    const errors = {};

    // TODO: Prevent date from being set beyond present date
    if (!fields.year || fields.year === '') {
      errors.year = 'Year is required';
    }

    if (!fields.month || fields.month === '') {
      errors.month = 'Month is required';
    }

    if (!fields.fileType || fields.fileType === '') {
      errors.fileType = 'File type is required';
    }

    return errors;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);

    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  generateOptions() {
    const currentYear = new Date(Date.now()).getFullYear();
    const yearOptions = {};
    // Assumes no statement can be made before 2018
    for (let i = currentYear; i >= 2018; i -= 1) {
      yearOptions[i] = { display: String(i) };
    }

    this.setState({ yearOptions });
  }

  //       <Menu {...menuProps}>
  //         <a
  //             });
  //             setTimeout(() => {
  //               });
  //             }, 400);
  //             }
  //           }}
  //         >
  //           { this.props.noItemsText || 'No Matches Found' }
  //         </a>
  //       </Menu>
  //     );
  //   }

  //         <MenuItem option={result} position={index}>
  //           {`"${result[labelKey] || result}" is not a valid field`}
  //         </MenuItem>
  //       );
  //     } else if (typeof result === 'string') {
  //         <MenuItem option={result} position={index}>
  //           {`Add "${result}" field`}
  //         </MenuItem>
  //       );
  //     }
  //   });

  //     <Menu {...menuProps}>
  //       {menuItems}
  //       {this.props.alwaysShowNoItemsOption && !(results.length === 1 && (results[0].name === this.state.value)) &&
  //         <a
  //             });
  //             setTimeout(() => {
  //               });
  //             }, 400);
  //             }
  //           }}
  //         >
  //           { this.props.noItemsText || 'No Matches Found' }
  //         </a>
  //       }
  //     </Menu>
  //   );
  // };

  render() {
    const form = this.state.form;
    if (!form) return null;

    const { submit, status } = this.props;

    const creating = status.creating;
    const createDisabled = creating || form._allInitial || !form._allValid;
    const error = status.creatingError;

    const selectedItems = form.fields.value.split(',').filter(item => item.length);

    return (
      <div className="floating-labels pt-3">
        <div className="row">
          <div className="col-3">
            <Components.forms.components.selectinput
              className="mb-0"
              form={form}
              type="text"
              field="year"
              action={this.standardFormAction}
              label="Year"
              placeholder="Select Year"
              options={this.state.yearOptions}
              disabled={creating}
              hideError={!form.year.touched}
              required
            />
          </div>
          <div className="col-3">
            <Components.forms.components.selectinput
              className="mb-0"
              form={form}
              type="text"
              field="month"
              action={this.standardFormAction}
              label="Month"
              placeholder="Select Month"
              options={this.state.monthOptions}
              disabled={creating}
              hideError={!form.month.touched}
              required
            />
          </div>
          <div className="col-3">
            <Components.forms.components.selectinput
              className="mb-0"
              form={form}
              type="text"
              field="fileType"
              action={this.standardFormAction}
              label="File Type"
              placeholder="Select File Type"
              options={this.state.fileTypeOptions}
              disabled={creating}
              hideError={!form.fileType.touched}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-3">
            <Components.forms.components.button
              disabled={createDisabled}
              onClick={() => { submit(); }}
              onDisabledClick={this.props.onDisabledClick}
              buttonText="Generate"
              updating={creating}
            />
          </div>
        </div>

        {error &&
          <div className="row d-flex justify-content-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          </div>
        }
        {this.props.showCreatedNotification &&
          <div className="row d-flex justify-content-center">
            <div className="alert alert-primary" role="alert">
              Statement successfully created!
            </div>
          </div>
        }

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createstatement);


