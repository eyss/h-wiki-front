import React, { Fragment } from 'react';
import { gql } from "apollo-boost";
import Navbar from './Navbar';
import { MdAssignmentInd, MdSync, MdSearch, MdAccountBox } from 'react-icons/md';
import { connect } from 'react-redux';

class RolesManagement extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        userName: '',
        role: '',
        currentRole: '',
        agentAddress: '',
        users: [],
        userSelected: false,
        valmsg: ''
      }
    }
    
    setRole = (e)=>{
      this.setState({
        role: e.target.value,
        valmsg: ''
      });
    }

    setUsername = (e)=> {
      this.setState({
        userName: e.target.value
      }, (_this = this)=>{
        let username = _this.state.userName;
        if (username.length >= 3) {
          _this.props.client
          .query({
            query: gql`
              {
                getUserInfo(username:"${username}") {
                  userName
                  id
                  role
                }
              }
            `
          }).then(res => {
            this.setState({
              users: res.data.getUserInfo
            });
          });
        }
      });
    }

     updateRole = async () => {
     if(!this.state.role.length){
      this.setState({
        valmsg: 'Select role'
      });
     }else {
      await this.props.client
        .mutate({
          mutation: gql`
            mutation roleUpdate(
              $currentRole: String!
              $agentAddress: ID!
              $newRole: String!
            ) {
              roleUpdate (currentRole:$currentRole, agentAddress:$agentAddress, newRole:$newRole) 
            }
          `,
          variables: {
            currentRole: this.state.currentRole,
            agentAddress: this.state.agentAddress,
            newRole: this.state.role,
          }
        }).then(res =>{
          this.props.client.resetStore();
          this.unselectUser();
        });
      }
    }

    unselectUser = ()=>{
      this.setState({
        userSelected: false,
        userName: '',
        currentRole: '',
        agentAddress: '',
        users: [],
        role: ''
      });
    }

    selectUser = (e)=>{
      let el = e.target,
          tag = el.nodeName,
          pos = el.dataset.pos;

      if (tag === 'SPAN') { pos = el.parentNode.dataset.pos; }
      let currentUser = this.state.users[pos];
      this.setState({
        userSelected: true,
        userName: currentUser.userName,
        currentRole: currentUser.role,
        agentAddress: currentUser.id,
        users: []
      });
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
                      <input
                        type="text"
                        placeholder="Insert username"
                        value={this.state.userName}
                        onChange={e => { this.setUsername(e) }}
                        disabled={
                          this.state.userSelected ?
                          true : false}
                      />
                      <div>
                          <label>{this.state.valmsg}</label>
                      </div>
                      <div>
                        {
                          !this.state.userSelected ?
                            <MdSearch />
                          :
                            <MdAccountBox />
                        }
                      </div>
                    </div>
                    
                    {this.state.userSelected &&
                      <Fragment>
                        <div>
                          <select value={this.state.role} onChange={e => {this.setRole(e)}}>
                            <option value="" defaultValue>Select role</option>
                            {this.state.currentRole.length > 0 && this.state.currentRole !== 'Admin' &&
                              <option value="Admin">Admin</option>
                            }
                            {this.state.currentRole.length > 0 && this.state.currentRole !== 'Editor' &&
                              <option value="Editor">Editor</option>
                            }
                            {this.state.currentRole.length > 0 && this.state.currentRole !== 'Reader' &&
                              <option value="Reader">Reader</option>
                            }
                          </select>
                        </div>
                        
                        <div>
                          <button onClick={e =>{ this.updateRole() }}>
                            Assign
                          </button>
                        </div>

                        <div>
                          <button onClick={e=>{this.unselectUser()}}>
                            <MdSync />
                          </button>
                        </div>
                      </Fragment>
                    }
                  </form>
                  
                </div>

                <div>
                  {this.state.users.length > 0 &&
                    <Fragment>
                      <div>
                        <label>Results:</label>
                      </div>

                      <div>
                        <ul>
                          {this.state.users.map((user, key)=>{
                            return(
                              <li key={key} data-pos={key} onClick={ e =>{ this.selectUser(e) }}>
                                {user.userName}
                                <span>{user.role}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </Fragment>
                  }

                </div>
              </section>

            </div>
          </section>
        </div>
      )
    }
  }
  
function mapDispatchToProps(dispatch) {
  return {};
}
    
function mapStateToProps(state) {
  return {
    client: state.client,
    userId: state.userId
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RolesManagement)