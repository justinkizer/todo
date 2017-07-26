import { connect } from 'react-redux';
import SplashPage from './splash_page.jsx';

const mapStateToProps = ({ session: { currentUser }}) => ({
  currentUser
});

export default connect(
  mapStateToProps
)(SplashPage);
