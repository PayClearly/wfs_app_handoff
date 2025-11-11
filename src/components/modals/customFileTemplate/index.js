import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  forms: state.forms,
  paymentPipelinePreferenceStatus: state.account.paymentPipelinePreferences.status,
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
});

const mapDispatchToProps = (dispatch, props) => ({
  setPreferences: (data) => {
    dispatch(Store.account.updatePaymentPipelinePreferences(data));
  },
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = (state, props) => ({});

class components_modals_customFileTemplate extends Component {

  state = {
    name: 'Components.forms.customFileTemplate',
    key: 'default',
    childFormName: 'Components.forms.customFileField',
  };

  componentDidUpdate(prevProps) {
    if (prevProps.paymentPipelinePreferenceStatus.updating && this.props.paymentPipelinePreferenceStatus.updated) {
      this.props.close();
    }
  }

  onSubmit = () => {
    const formData = this.props.forms[this.state.name][this.state.key]._children.map((childForm) => this.props.forms[childForm.name][childForm.key]._values);

    /** @type {import('../../../../src/components/entities/customFileParser/types').TemplateField[]} */
    const fields = formData.map(({ fieldName = '', pcField }) => {
      const prefix = 'pcLine-';
      const formatSuffix = '?format=';
      const aliasPrefix = 'alias-';

      return {
        fieldName: fieldName.split(formatSuffix)[0],
        format: fieldName.split(formatSuffix)[1],
        alias: pcField.find((field) => field.includes(aliasPrefix)),
        pcField: pcField.filter((field) => !(field.includes(prefix)) && !(field.includes(aliasPrefix)))[0],
        lineItemField: pcField.find((field) => (field.includes(prefix))) ? pcField.find((field) => (field.includes(prefix))).split(prefix)[1] : null,
      };
    });

    const data = {};

    if (this.props.mode === 'upload') { data.uploadTemplate = fields; }
    if (this.props.mode === 'download') { data.downloadTemplate = fields; }
    this.props.setPreferences({ ...data });
  };

  render() {
    const {
      mode,
      close,
      paymentPipelinePreferenceStatus,
      initialData,
    } = this.props;
    const form = _try(() => this.props.forms[this.state.name][this.state.key], {});
    const valid = form._allValid;

    return (
      <div style={{ margin: '1.74rem' }} role="document">
        <div className="modal-content components_modals_customFileTemplate">

          <div className="modal-header">
            <h2 className="modal-title ps-4" style={{ 'font-weight': '100', 'font-color': '#05AEDD' }}>
              <i className="mdi mdi-cog me-3" style={{ 'font-size': '30px', color: '#54667a' }} />{Utils.capitalize(mode)} Template Editor
            </h2>
            <button onClick={close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body px-5" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <Components.forms.customFileTemplate mode={mode} initialData={initialData} />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={close}
            >
              Cancel
            </button>
            <Components.button
              className="btn btn-primary"
              data-dismiss="modal"
              disabled={!valid || paymentPipelinePreferenceStatus.updating}
              onClick={this.onSubmit}
              updating={paymentPipelinePreferenceStatus.updating}
              buttonText="Save"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_customFileTemplate);


