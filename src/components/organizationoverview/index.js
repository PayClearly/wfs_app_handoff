import { connect, Component } from 'component';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_organizationoverview extends Component {
  render() {
    const { organizationItem } = this.props;

    return (
      <div className="row components_organizationoverview">
        <div className="col">
          <strong>Organization Name</strong>
          <br />
          <p className="text-muted">
            <span className="pe-2">{organizationItem.name}</span><br />
            {
              organizationItem.active
                ? <span className="badge rounded-pill bg-primary">Active</span>
                : <span className="badge rounded-pill bg-secondary">Inactive</span>
            }
          </p>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_organizationoverview);
