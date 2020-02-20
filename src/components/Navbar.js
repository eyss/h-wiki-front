import React from 'react';
import { Link } from 'react-router-dom';
import { MdLibraryAdd, MdAccountCircle, MdAssignmentInd, MdHome } from 'react-icons/md';
class Navbar extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    refreshLinks = ()=>{
      if (this.props.refreshLinks) {
        this.props.refreshLinks();
      }
    }
  
    render() {
      return (
        <nav>
            <div>
                <div onClick={e =>{ this.refreshLinks(e) }}></div>
            </div>
  
            <div>
              <ul>
              {this.props.page !== 'wiki' &&
                <li>
                  <Link to='/'>
                    <MdHome className='wiki' /> Home
                  </Link>
                </li>
              }

              { (!this.props.userName.length && this.props.page !== 'sign-up') && 
                <li>
                  <Link to='/sign-up'>
                    <MdAccountCircle /> Sign Up
                  </Link>
                </li>
              }

              { (this.props.role === 'Admin' && this.props.page !== 'user-managment' )&& 
                <li>
                  <Link to='/user-managment'>
                    <MdAssignmentInd /> User managment
                  </Link>
                </li>
              }

              { (this.props.page === 'wiki' && 
                  (this.props.role === 'Admin' || this.props.role === 'Editor')
                ) &&
                <li>
                  <button onClick={this.props.createPage} className='btn-createpage'>
                    <MdLibraryAdd /> Create page
                  </button>
                </li>
              }
              </ul>
            </div>
  
            {this.props.loadingPage &&
              <div className='linear-preloader'>
                <div></div>
              </div>
            }
          </nav>
      )
    }
  }
  
  export default Navbar;