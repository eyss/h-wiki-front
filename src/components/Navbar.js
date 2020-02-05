import React from 'react';
import { MdLibraryAdd, MdHome, MdAccountCircle, MdAssignmentInd, MdLocalLibrary } from 'react-icons/md';
class Navbar extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
  
      }  
    }
  
    render() {
      return (
        <nav>
            <div>
                <div></div>
            </div>
  
            <div>
            {/* typeof this.props.createPage === 'function' && 
            <button onClick={this.props.createPage}><MdLibraryAdd /></button>*/}        
              <div>
                  <ul>
                    <li>
                      <button><MdLocalLibrary className='wiki' /></button>
                    </li>

                    <li>
                      <button><MdAccountCircle /> Sign in</button>
                    </li>
                    
                    <li>
                      <button><MdAssignmentInd /> User managment</button>
                    </li>
                </ul>
              </div>

              <div>
                <button className='btn-createpage'>
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