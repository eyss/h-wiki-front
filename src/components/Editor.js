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

  updateSectionPage = () => {   
    this.props.updateSectionPage(
      this.props.pos, 
      {
        markdown: this.mdEditor.getMdValue(),
        html: this.mdEditor.getHtmlValue()
      },
      this.props.mode);
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
          />
        </div>
        <footer>
          <div>
            <button onClick={this.closeModal}>Cancel</button>
            <button onClick={this.updateSectionPage}>Add</button>
          </div>
        </footer>               
      </div>
    )
  }
}