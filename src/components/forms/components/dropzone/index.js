import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import csvtojson from 'csvtojson';
import axios from 'axios';

// import Utils from 'utils';
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

class components_forms_components_dropzone extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  onDrop = (acceptedFiles) => {
    const items = [];

    acceptedFiles.forEach((acceptedFile) => {
      return axios.get(acceptedFile.preview)
        .then(({ data }) => {
          return csvtojson()
            .fromString(data)
            .on('json', (jsonObj) => {
              data.push(jsonObj);
            })
            .on('done', () => {
              this.uploadPayments(items);
            });
        });
    });
  };

  render() {
    const field = {}; // TODO make form field ????

    return (
      <div
        className={classNames('components_forms_components_textArea', 'form-group', { 'has-error': (field.error && !this.props.hideError) })}
      >
        <Components.dropzone
          onDrop={this.onDrop}
          // if there is a csvFields prop then it needs featureName as well to account for the name of the downloaded template file
          // featureName={this.props.featureName}
          accept="text/csv,.csv"
          csvFields={[Object.values(this.props.template)]}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_dropzone);


