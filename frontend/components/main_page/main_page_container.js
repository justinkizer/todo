import { connect } from 'react-redux';
import MainPage from './main_page.jsx';

const mapStateToProps = ({session: {currentUser}}) => ({
  currentUser
});

export default connect(
  mapStateToProps
)(MainPage);
