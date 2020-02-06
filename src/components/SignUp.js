import React from 'react';
import Navbar from './Navbar';
import Alert from './Alert';
import {MdPerson} from 'react-icons/md';
import { connect } from 'react-redux';
/** Apollo cliente, GraphQL */
import { gql } from "apollo-boost";

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      alert: false,
      confirmation: false,
      confirmationMsg: '',
      preloader: false,
      preloaderMsg: '',
      loadingPage: true
    }
    this.username = React.createRef();
  }

  componentDidMount() {
    this.setState({loadingPage: false});
    console.log('props Sign up', this.props);
  }

  setUsername = (e) => {
    if (!/\s/.test(e.target.value)) {
      this.setState({
        username: e.target.value
      });
    }
  }

  registerUser(e) {
    e.preventDefault();
    this.setState({
      preloader: true,
      alert: true,
      preloaderMsg: 'registering user'
    });

    this.props.client
    .mutate({
      mutation: gql`
        mutation createUser($name: String!) {
          createUser(name: $name) {
            userName
            roles {
              name
            }
           }
        }
      `,
      variables: {
        name: this.state.username
      }
    })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => {
      console.log(err);
    })
    .finally(e => {
      this.setState({
        preloader: false,
        alert: false,
        preloaderMsg: '',
        username: ''
    }, () => this.username.current.focus());
    })
  }

  render() {
    return (
      <div className='container'>
        <Navbar 
          loadingPage={this.state.loadingPage}
          page='sign-up'
          role={this.props.userId.role}
          userName={this.props.userId.userName}
        />
        <section className="user-registry-container">
          <div>
            <div>
              <div>
                <MdPerson />
              </div>
              <div>
                <label>Register user</label>
              </div>
            </div>
            <form onSubmit={e => this.registerUser(e)}>
              <div>
                <input
                  placeholder='Username'
                  onChange={e => this.setUsername(e) }
                  value={this.state.username}
                  ref={this.username}
                  autoFocus
                />
              </div>
              <div>
                <button type='submit'>Submit</button>
              </div>
            </form>
          </div>
          {this.state.loadingPage && <div className='blocker'></div>}
        </section>

        <Alert
          alert = {this.state.alert}
            
          confirmation = {this.state.confirmation}
          confirmationMsg = {this.state.confirmationMsg}

          preloader = {this.state.preloader}
          preloaderMsg = {this.state.preloaderMsg}            
        />
      </div>
    )
  }
}
  
function mapDispatchToProps(dispatch) {
  return {
    pepito: function(val) {
      dispatch({
        type: 'SET_PEPITO',
        value: val
      })
    }
  }
}

function mapStateToProps(state) {
  return {
    client: state.client,
    userId: state.userId
  }
}
  
export default connect(mapStateToProps, mapDispatchToProps)(SignUp)