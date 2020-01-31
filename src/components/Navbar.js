import React from 'react';
import { MdLibraryAdd } from 'react-icons/md';
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
                { typeof this.props.createPage === 'function' && 
                  <button onClick={this.props.createPage}><MdLibraryAdd /></button>
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