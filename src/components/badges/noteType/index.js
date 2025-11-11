import { connect, Component } from 'component';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

class components_badges_noteType extends Component {
  render() {
    const { text, color } = this.props;
    return (
      <span style={{ fontSize: '70%' }} className={`badge rounded-pill bg-${color} me-2`}>{text}</span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_noteType);
