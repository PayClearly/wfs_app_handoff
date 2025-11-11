import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_reporttemplate extends Component {




  render() {
    const { filename, description, status, type, schedule, orderBy, exports, startDate, endDate, emailContacts, selectFields } = _formatTemplateFields(this.props.template);

    return (
      <Fragment>
        <div className="row mb-2">
          <h3 className="mb-3">
            <span className="float-start ms-3 me-3">
              {filename}
            </span>
            <Components.badges.status data={status} />
            <br />
            {
              description &&
              <h5 className="ms-3 me-3">{description}</h5>
            }
          </h3>

        </div>
        <div className="row mb-2">
          <div className="col-md-6 col-xs-12">
            <strong>Report Type</strong>
            <p className="text-muted">{type}</p>
          </div>
          <div className="col-md-6 col-xs-12">
            <strong>Schedule</strong>
            <p className="text-muted">{schedule}</p>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-6 col-xs-12">
            <strong>Order By</strong>
            <p className="text-muted">{orderBy}</p>
          </div>
          {
            schedule === 'Immediate' &&
            <Fragment>
              <div className="col-md-3 col-xs-6">
                <strong>From</strong>
                <p className="text-muted">{startDate}</p>
              </div>
              <div className="col-md-3 col-xs-6">
                <strong>To</strong>
                <p className="text-muted">{endDate}</p>
              </div>
            </Fragment>
          }
        </div>

        <div className="row mb-2">
          <div className="col-md-6 col-xs-12">
            <strong>Export Format</strong>
            <p className="text-muted">{exports}</p>
          </div>
          <div className="col-md-6 col-xs-12">
            <strong>Email Contacts</strong>
            <p className="text-muted">{emailContacts.map(email => <Fragment>{email}<br /></Fragment>)}</p>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_reporttemplate);

// Internal Helper Functions ...
const _formatDate = date => (Utils.dates.dateToDay(Date.parse(date), 'dayOnly')) || undefined;
const _capitalize = string => (string.charAt(0).toUpperCase() + string.slice(1)) || undefined;
const _formatTemplateFields = (template) => {
  const type = _capitalize(template.type);
  const status = _capitalize(template.status);
  const orderBy = `${template.orderBy.dataField} (${template.orderBy.direction})`;
  const schedule = _capitalize(template.schedule);
  const startDate = _formatDate(template.startDate);
  const endDate = _formatDate(template.endDate);
  const exports = template.exports.reduce(((a, c) => a + c.toUpperCase()), '');
  const emailContacts = template.emailContacts || ['None'];
  const selectFields = template.selectFields.map(({ fieldName, customName }, index) => {
    return customName ? `${index + 1}: ${fieldName} (${customName})` : `${index + 1}: ${fieldName}`;
  });

  return {
    ...template,
    type,
    status,
    orderBy,
    schedule,
    startDate,
    endDate,
    exports,
    emailContacts,
    selectFields,
  };
};
// GENERATOR_TYPE='component';
