import React from 'react'
import MdEditor from 'react-markdown-editor-lite'
import MarkdownIt from 'markdown-it';
import '../styles/Editor.scss';

export default class Editor extends React.Component {
  mdEditor = null
  mdParser = null
  constructor(props) {
    super(props)
    this.mdParser = new MarkdownIt()

    this.content = '';
  }
  handleEditorChange ({html, text}) {    
    console.log('handleEditorChange', html, text)
  }

  handleGetMdValue = () => {   
    this.mdEditor && console.log(this.mdEditor.getMdValue())      
  }

  closeModal = () => {    
    document
      .querySelector('#modal-add-section')
        .style.display = 'none';
  }

  render() {
    return (      
      <div id="rmel-container">
        <header>
          <label>MdEditor</label>
        </header>
        <div>
          <MdEditor
            ref={node => this.mdEditor = node}  
            value={this.props.getContentSection(this.props.pos, this.props.mode)}
            renderHTML={(text) => this.mdParser.render(text)}
            onChange={this.handleEditorChange} 
          />
        </div>
        <footer>
          <div>
            <button onClick={this.closeModal}>Cancel</button>
            <button onClick={this.handleGetMdValue}>Add</button>
          </div>
        </footer>               
      </div>
    )
  }
}