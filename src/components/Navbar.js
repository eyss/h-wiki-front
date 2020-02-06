import React from 'react';
import { Link } from 'react-router-dom';
import { MdLibraryAdd, MdAccountCircle, MdAssignmentInd, MdLocalLibrary } from 'react-icons/md';
class Navbar extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
  
    render() {
      return (
        <nav>
            <div>
                <div></div>
            </div>
  
            <div>     
              <div className={(this.props.page !== 'wiki' || this.props.role === 'Reader')  ? 'only-menu' : ''}>
                  <ul>
                    {(this.props.page !== 'wiki') &&
                      <li>
                        <Link to='/'>
                          <MdLocalLibrary className='wiki' />
                        </Link>
                      </li>
                    }

                    {(this.props.page !== 'sign-up' && this.props.userName.length === 0) && 
                      <li>
                        <Link to='/sign-up'>
                          <MdAccountCircle /> Sign Up
                        </Link>
                      </li>
                    }
                    
                    {(this.props.page !== 'user-managment' && this.props.role === 'Admin') &&
                      <li>
                        <Link to='/user-managment'>
                          <MdAssignmentInd /> User managment
                        </Link>
                      </li>
                    }
                </ul>
              </div>

              {(this.props.page === 'wiki' && (this.props.role === 'Admin' || this.props.role === 'Editor')) && 
                <div>
                  <button onClick={this.props.createPage} className='btn-createpage'>
                    <MdLibraryAdd /> Create page
                  </button>
                </div>
              }
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