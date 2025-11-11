import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonItem, IonLabel, IonNote, IonButton, IonIcon, IonText } from '@ionic/react';
import { caretDownSharp } from 'ionicons/icons';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openSelectModal: (field, action, options) => {
      dispatch(Store.router.openModal('Components.ionic.modals.select', { field, action, animation: 'slideUp', options }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_forms_components_select extends Component {

  state = {
    optionsByValue: {},
  }

  componentDidMount() {
    const optionsByValue = this.props.options.reduce((acc, { label, value }) => {
      acc[value] = label;
      return acc;
    }, {});
    this.setState({ optionsByValue });
  }


  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const hidden = this.props.hidden;

    if (!field || hidden) return null;

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;


    const errorState = !!(field.error && !this.props.hideError);

    const placeholderText = this.props.placeholder || '';
    const displayText = this.state.optionsByValue[field.value] || placeholderText;
    return (
      <IonItem lines="none" className={`components_ionic_forms_components_select ion-no-padding ${this.props.className} ${this.props.readonly && 'readonly'}`}>
        <IonLabel position="stacked">{this.props.label}</IonLabel>
        <IonButton
          className="modal-select"
          fill="none"
          color={errorState && 'danger'}
          expand="block"
          style={errorState ? { 'border-color': 'var(--ion-color-danger)' } : {}}
          onClick={() => this.props.openSelectModal(fieldName, this.props.action, this.props.options)}
          disabled={this.props.disabled || this.props.readonly || false}
        >
          <div style={{ width: '100%' }} className="space-between">
            <IonText slot="start" className="ion-text-left">{displayText}</IonText>
            <IonIcon className="select-icon" slot="end" size="small" icon={caretDownSharp} />
          </div>
        </IonButton>
        <IonNote color="danger">{errorState ? field.error : ' '}</IonNote>
      </IonItem>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_forms_components_select);


