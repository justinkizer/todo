import { connect } from 'react-redux';
import SessionFormWithMutations from './session_form.jsx';
import { signInUser } from '../../actions/session_actions.js';

const mapDispatchToProps = (dispatch, ownProps) => ({
  signInUser: user => dispatch(signInUser(user))
});

export default connect(
  null,
  mapDispatchToProps
)(SessionFormWithMutations);
