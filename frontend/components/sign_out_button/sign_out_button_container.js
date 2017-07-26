import { connect } from 'react-redux';
import SignOutButtonWithMutation from './sign_out_button.jsx';
import { signOutUser } from '../../actions/session_actions.js';

const mapDispatchToProps = dispatch => ({
  signOutUser: () => dispatch(signOutUser())
});

export default connect(
  null,
  mapDispatchToProps
)(SignOutButtonWithMutation);
