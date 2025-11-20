import { connect, Component } from 'component';

import Store from 'store';
import Components from 'components';


const mapStateToProps = (state) => ({
  paymentPipelinePreferences: _try(() => state.account.paymentPipelinePreferences.data.item, {}),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (data) => {
    dispatch(Store.router.openModal('Components.modals.customFileTemplate', data));
  },
});


// eslint-disable-next-line camelcase
class components_entities_customFileParser extends Component {
  render() {
    const { uploadTemplate, downloadTemplate } = this.props.paymentPipelinePreferences;
    return (
      <div className="components_entities_customFileParser mb-5">
        {this.props.title && <h3>{this.props.title}</h3>}
        <div className="row">
          <div className="col-12">
            <Components.button
              onClick={() => this.props.openModal({
                initialData: uploadTemplate,
                mode: 'upload',
              })}
              buttonText={`${uploadTemplate ? 'Edit' : 'Create'} Upload Template`}
              className="btn btn-primary"
              icon={`pe-1 mdi mdi-${uploadTemplate ? 'pencil' : 'plus-circle'}-outline`}
            />
            <Components.button
              onClick={() => this.props.openModal({
                initialData: downloadTemplate,
                mode: 'download',
              })}
              buttonText={`${downloadTemplate ? 'Edit' : 'Create'} Download Template`}
              className="btn btn-primary ms-1"
              icon={`pe-1 mdi mdi-${downloadTemplate ? 'pencil' : 'plus-circle'}-outline`}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_customFileParser);
