import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    tags: state.global.tags.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_globalVendorTag extends Component {




  render() {
    const { id, tags } = this.props;
    const tag = tags[id] || {};
    const notSetTag = (<i>Not set</i>);

    const description = tag.description || notSetTag;
    const aliases = _try(() => tag.aliases.length) ? tag.aliases.join(', ') : notSetTag;

    return (
      <div className="components_overviews_globalVendorTag">
        <div className="row mb-2">
          <h3 className="mb-3"><span className="float-start ms-3 me-3">{tag.name}</span></h3>
        </div>
        <div className="row mb-2">
          <div className="col-6">
            <strong>Aliases</strong>
            <br />
            <p className="text-muted">{aliases}</p>
          </div>
          <div className="col-6">
            <strong>Description</strong>
            <br />
            <p className="text-muted">{description}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorTag);


