import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonDatetime, IonItem, IonLabel, IonNote } from '@ionic/react';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_forms_components_datepicker extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const hidden = this.props.hidden;

    if (!field || hidden) return null;

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;

    const errorState = !!(field.error && !this.props.hideError);

    return (
      <IonItem lines="none" className={`components_ionic_forms_components_datepicker ion-no-padding ${this.props.className} ${this.props.readonly && 'readonly'}`}>
        <IonLabel position="stacked">{this.props.label}</IonLabel>
        <IonDatetime
          displayFormat={this.props.displayFormat || "MM-DD-YYYY"}
          locale="en-US"
          hourCycle="h23"
          value={(new Date(field.value)).toISOString()}
          onIonChange={e => this.props.action('change', this.props.field, Date.parse(e.detail.value))}
          onIonBlur={() => this.props.action('blur', this.props.field)}
          onIonFocus={() => this.props.action('focus', this.props.field)}
          disabled={this.props.disabled || this.props.readonly || false}
          max={this.props.max}
          min={this.props.min}
          required
        />
        <IonNote color="danger">{errorState ? field.error : ' '}</IonNote>
      </IonItem>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_forms_components_datepicker);


