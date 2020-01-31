import React from 'react';
import Navbar from './Navbar';
import {MdPerson} from 'react-icons/md';

class UserRegistry extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        username: ''
      }  
    }

    setUsername = (e) => {
        this.setState({ username: e.target.value });
    }

    registerUser() {
        
    }
  
    render() {
      return (
        <div className='container'>
          <Navbar  />
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

                <form>
                    <div>
                        <input
                            placeholder='Username'
                            onChange={e => this.setUsername(e) }
                            value={this.state.username}
                            autoFocus
                        />
                    </div>

                    <div>
                        <button onClick={e => this.registerUser()}>Submit</button>
                    </div>
                </form>
            </div>
          </section>
        </div>
      )
    }
  }
  
  export default UserRegistry;