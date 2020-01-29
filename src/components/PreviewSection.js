import React from 'react';
import {MdMoreVert, MdCreate, MdRemove, MdPlaylistAdd} from "react-icons/md"; 

import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
export default class PreviewSection extends React.Component {
    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
      super(props);
      this.mdParser = new MarkdownIt();

      this.ps = React.createRef();
    }

    componentDidMount() {
      this.ps.current
      .addEventListener('click', (e)=>{
        if (e.target.nodeName === 'A') {
          e.preventDefault();
        }
      });
    }

    showEditor = (mode) => {
      console.log('Modo en Preview.js para mostrar el editor', mode);
      this.props.showEditor(mode, this.props.pos)
    }

    removeSection = () => {
      this.props.showConfirmation({
        process: 'remove',
        pos: this.props.pos
      });
    }

    render() {
        return(
            <div className='preview-section'>
                <div ref={this.ps}>
                  <MdEditor
                    ref={node => this.mdEditor = node}  
                    value={!this.props.element_content ? this.props.content : this.props.element_content }
                    renderHTML={(text) => this.mdParser.render(text)}
                  />
                </div>

                <div>
                  <div>
                    <ul>
                      <li>
                          <button>
                            <MdMoreVert />
                          </button>
                          <ul>
                              <li>
                                <button onClick={e => {this.showEditor('edit')}}>
                                  <MdCreate /> Edit
                                </button>
                              </li>
                              
                              <li>
                                <button onClick={this.removeSection}>
                                  <MdRemove /> Remove
                                </button>
                              </li>


                              {this.props.pos === 0 &&
                                <li>
                                <button onClick={e => {this.showEditor('addsa')}}>
                                    <MdPlaylistAdd /> Add section above
                                  </button>
                                </li>
                              }
                                                            
                              <li>
                                <button onClick={e => {this.showEditor('addsb')}}>
                                  <MdPlaylistAdd /> Add section below
                                </button>
                              </li>
                            
                          </ul>
                      </li>
                    </ul>
                  </div>
                </div>
                
            </div>
        )
    }
}