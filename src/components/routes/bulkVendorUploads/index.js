import { connect, Component } from 'component';
import Components from 'components';

const mapStateToProps = (state) => ({
  params: state.router.route.params,
  jobs: state.jobs.bulkVendorUploads,
});

const mapDispatchToProps = () => ({});

class components_routes_bulkVendorUploads extends Component {
  render() {
    if (!this.props.jobs.status.fetched) {
      return <Components.spinner />;
    }

    const { jobId } = this.props.params;

    if (this.props.jobs.data.items[jobId]) {
      return <Components.overviews.bulkVendorUploads jobId={jobId} />;
    }

    return <Components.tables.bulkVendorUploads />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_bulkVendorUploads);
