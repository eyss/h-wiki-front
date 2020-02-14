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
              <div>
                  <ul>
                      <li>
                        <Link to='/'>
                          <MdLocalLibrary className='wiki' />
                        </Link>
                      </li>

                      <li>
                        <Link to='/sign-up'>
                          <MdAccountCircle /> Sign Up
                        </Link>
                      </li>
                    
                      <li>
                        <Link to='/user-managment'>
                          <MdAssignmentInd /> User managment
                        </Link>
                      </li>
                </ul>
              </div>
                <div>
                  <button onClick={this.props.createPage} className='btn-createpage'>
                    <MdLibraryAdd /> Create page
                  </button>
                </div>
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