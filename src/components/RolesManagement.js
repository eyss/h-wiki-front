import React from 'react';
import Navbar from './Navbar';
import { MdClose, MdAssignmentInd } from 'react-icons/md';
import { connect } from 'react-redux';

class RolesManagement extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
  
      }
    }
  
    render() {
      return (
        <div className='container'>
          <Navbar 
            page='user-managment'
            role={this.props.userId.role}
            userName={this.props.userId.userName}
          />
          <section className="roles-managment-container">
            <div>

              <header>
                <label><MdAssignmentInd /> Managment User</label>
              </header>

              <section>
                <div>
                  <form onSubmit={e => e.preventDefault() }>
                    <div>
                      <input type="text" placeholder="Insert username" />
                    </div>
                    
                    <div>
                      <select>
                        <option defaultValue value="">Select role</option>
                        <option value="">Administrator</option>
                        <option value="">Editor</option>
                        <option value="">Reader</option>
                      </select>
                    </div>
                    
                    <div>
                      <button>Assign</button>
                    </div>
                  </form>
                  
                </div>

                <div>
                    
                  <div>
                    <div>
                      <label>Results:</label>
                    </div>
                    <div>
                      <button><MdClose /></button>
                    </div>
                  </div>

                  <div>
                    <ul>
                      <li>
                        Alix
                        <span>Admin</span>
                      </li>

                      <li>
                        Jhonatan
                        <span>Admin</span>
                      </li>

                      <li>
                        Carlos
                        <span>Admin</span>
                      </li>

                      <li>
                        Hector
                        <span>Admin</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </section>

            </div>
          </section>
        </div>
      )
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      pepito: function(val) {
        console.log('funcion pepito');
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

export default connect(mapStateToProps, mapDispatchToProps)(RolesManagement)