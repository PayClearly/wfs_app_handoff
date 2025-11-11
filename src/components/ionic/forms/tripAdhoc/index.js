/* eslint-disable react/jsx-pascal-case */
import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonText, IonButton, IonIcon, IonItem, IonList, IonLabel, IonCheckbox, IonListHeader, IonActionSheet, IonNote } from '@ionic/react';
import { receipt } from 'ionicons/icons';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    updating: state.wfs.adhocTrips.status.updating,
    creating: state.wfs.adhocTrips.status.creating,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_forms_tripAdhoc extends Component {
  state = {
    show: 'departure',
    name: 'Components.ionic.forms.tripAdhoc',
    forUpdate: false,
    showReceiptActionSheet: false,
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      tailNumber: initialFormData.tailNumber || '',
      tripNumber: initialFormData.tripNumber || '',
      tripName: initialFormData.amount || '',
      startDate: initialFormData.startDate || Date.now(),
      endDate: initialFormData.endDate || new Date(Date.now() + 86400000), // Defaulting to next day
      originICAO: initialFormData.originICAO || '',
      destinationICAO: initialFormData.destinationICAO || '',
      originFBO: initialFormData.departureRequestedServices && initialFormData.departureRequestedServices.FBO._id || '',
      originFUEL: initialFormData.departureRequestedServices && initialFormData.departureRequestedServices.FUEL._id || '',
      originCATERING: initialFormData.departureRequestedServices && initialFormData.departureRequestedServices.CATERING._id || '',
      originHOTEL: initialFormData.departureRequestedServices && initialFormData.departureRequestedServices.HOTEL._id || '',
      originTRANSPORTATION: initialFormData.departureRequestedServices && initialFormData.departureRequestedServices.TRANSPORTATION._id || '',
      destinationFBO: initialFormData.arrivalRequestedServices && initialFormData.arrivalRequestedServices.FBO._id || '',
      destinationFUEL: initialFormData.arrivalRequestedServices && initialFormData.arrivalRequestedServices.FUEL._id || '',
      destinationCATERING: initialFormData.arrivalRequestedServices && initialFormData.arrivalRequestedServices.CATERING._id || '',
      destinationHOTEL: initialFormData.arrivalRequestedServices && initialFormData.arrivalRequestedServices.HOTEL._id || '',
      destinationTRANSPORTATION: initialFormData.arrivalRequestedServices && initialFormData.arrivalRequestedServices.TRANSPORTATION._id || '',
    });
    validate(this.state.name, formKey, this.validate);

    this.setState({ key: formKey, forUpdate: !!Object.keys(initialFormData).length });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);

    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }

  async componentDidUpdate(prevProps) { }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) return null;

    const inProgress = this.props.updating || this.props.creating;
    const readonly = false;

    const yearInMS = 31556952000;
    return (
      <form className="components_ionic_forms_tripAdhoc ion-margin" onSubmit={this.props.onSubmit}>
        <IonList>
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="tailNumber"
            action={this.standardFormAction}
            label="Tail Number"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.tailNumber.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="number"
            inputmode="numeric"
            placeholder=""
            field="tripNumber"
            action={this.standardFormAction}
            label="Trip Number"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.tripNumber.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="tripName"
            action={this.standardFormAction}
            label="Trip Name"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.tripName.touched}
          />

          <IonListHeader className="ion-no-padding">DEPARTURE</IonListHeader>

          <Components.ionic.forms.components.datepicker
            form={form}
            displayFormat="MM-DD-YYYY | HH:mm"
            field="startDate"
            min={(new Date(Date.now() - (yearInMS * 3))).toISOString()}
            max={(new Date(Date.now() + (yearInMS * 3))).toISOString()}
            label="Scheduled Departure Date"
            action={this.standardFormAction}
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.startDate.touched}
          />

          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            field="originICAO"
            action={this.standardFormAction}
            label="Origin ICAO"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.originICAO.touched}
          />

          <IonListHeader className="ion-no-padding">ARRIVAL</IonListHeader>

          <Components.ionic.forms.components.datepicker
            form={form}
            field="endDate"
            displayFormat="MM-DD-YYYY | HH:mm"
            min={(new Date(Date.now() - (yearInMS * 3))).toISOString().slice(0, 10)}
            max={(new Date(Date.now() + (yearInMS * 3))).toISOString().slice(0, 10)}
            label="Scheduled Arrival Date"
            action={this.standardFormAction}
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.endDate.touched}
          />

          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            field="destinationICAO"
            action={this.standardFormAction}
            label="Destination ICAO"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.destinationICAO.touched}
          />

          <IonListHeader className="ion-no-padding">DEPARTURE SERVICES</IonListHeader>

          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="originFBO"
            action={this.standardFormAction}
            label="FBO"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.originFBO.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="originFUEL"
            action={this.standardFormAction}
            label="FUEL"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.originFUEL.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="originCATERING"
            action={this.standardFormAction}
            label="CATERING"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.originCATERING.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="originTRANSPORTATION"
            action={this.standardFormAction}
            label="TRANSPORTATION"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.originTRANSPORTATION.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="originHOTEL"
            action={this.standardFormAction}
            label="HOTEL"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.originHOTEL.touched}
          />

          <IonListHeader className="ion-no-padding">ARRIVAL SERVICES</IonListHeader>

          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="destinationFBO"
            action={this.standardFormAction}
            label="FBO"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.destinationFBO.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="destinationFUEL"
            action={this.standardFormAction}
            label="FUEL"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.destinationFUEL.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="destinationCATERING"
            action={this.standardFormAction}
            label="CATERING"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.destinationCATERING.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="destinationTRANSPORTATION"
            action={this.standardFormAction}
            label="TRANSPORTATION"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.destinationTRANSPORTATION.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            placeholder=""
            field="destinationHOTEL"
            action={this.standardFormAction}
            label="HOTEL"
            position="stacked"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.destinationHOTEL.touched}
          />
        </IonList>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_forms_tripAdhoc);


