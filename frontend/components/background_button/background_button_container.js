import { connect } from 'react-redux';
import BackgroundButtonWithMutation from './background_button.jsx';
import { signInUser } from '../../actions/session_actions.js';

const mapStateToProps = ({ session: { currentUser }}) => ({
  currentUser
});

const mapDispatchToProps = dispatch => ({
  updateUser: user => dispatch(signInUser(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BackgroundButtonWithMutation);
