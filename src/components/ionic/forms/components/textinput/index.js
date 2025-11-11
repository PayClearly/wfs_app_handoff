import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonItem, IonLabel, IonNote, IonInput } from '@ionic/react';


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

class components_ionic_forms_components_textinput extends Component {




  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const hidden = this.props.hidden;

    if (!field || hidden) return null;

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;

    const errorState = !!(field.error && !this.props.hideError);

    return (
      <IonItem lines="none" className={`components_ionic_forms_components_textinput ion-no-padding ${this.props.className} ${this.props.readonly && 'readonly'}`}>
        <IonLabel color={errorState && 'danger'} position={this.props.position || 'stacked'}>{this.props.label}</IonLabel>
        <IonInput
          id={id}
          color={errorState && 'danger'}
          style={errorState ? { 'border-color': 'var(--ion-color-danger)' } : {}}
          placeholder={this.props.placeholder}
          type={this.props.type}
          value={field.value}
          inputmode={this.props.inputmode}
          onIonChange={e => this.props.action('change', fieldName, e.target.value)}
          onIonBlur={() => this.props.action('blur', fieldName)}
          onIonFocus={() => this.props.action('focus', fieldName)}
          disabled={this.props.disabled || this.props.readonly || false}
          required={this.props.required}
        />
        <IonNote color="danger">{errorState ? field.error : ' '}</IonNote>

      </IonItem>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_forms_components_textinput);


