import React from 'react';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';

export default class Editor extends React.Component {
  mdEditor = null;
  mdParser = null;
  constructor(props) {
    super(props);
    this.mdParser = new MarkdownIt();
    this.editor = React.createRef();

    this.autocompleteCont = React.createRef();
  }
  
  componentDidMount() {
    this.editor.current
    .addEventListener('click', (e)=>{
      if (e.target.nodeName === 'A') {
        e.preventDefault();
      }
    });

    console.clear();
    var elemento = this.editor.current.querySelector('#textarea'),
        cordinates = elemento.getBoundingClientRect(),
        { width, height, left, top } = cordinates,
        style = `width: ${width}px; height: ${height}px; left: ${left}px; top: ${top}px;`;

    this.autocompleteCont.current.setAttribute('style', style);
  }

  updatePageSections = () => {
   if (this.props.mode === 'edit') {
      this.props.showConfirmation({
        process: 'update',
        pos: this.props.pos,
        mode: this.props.mode,
        content: this.mdEditor.getMdValue(),
        currentSection: this.props.getContentSection(this.props.pos, this.props.mode)
      });
    } else {
      this.props.updatePageSections(
        this.props.mode,
        this.props.pos,
        this.mdEditor.getMdValue(),
        this.props.getContentSection(this.props.pos, this.props.mode)
      );
    }
  }
  
  close = () => {    
    this.props.closeEditor();
  }

  render() {
    
    var content = '', txtBtn = 'Save';
    if (this.props.mode === 'edit') {
      content = this.props.getContentSection(this.props.pos, this.props.mode).content;
      txtBtn = 'Update';
    }
    var option = 'name page';
    return (
      <div id='editor'>
        <div>
          <div id="rmel-container">
            <header>
              <label>Markdown editor</label>
            </header>
            <div ref={this.editor}>
              <MdEditor
                ref={node => this.mdEditor = node}  
                value={content}
                renderHTML={(text) => this.mdParser.render(text)}
              />
            </div>
            <footer>
              <div>
                <button onClick={this.close}>Cancel</button>
                <button onClick={this.updatePageSections}>{txtBtn}</button>
              </div>
            </footer>

            <div className='autocomplete-cont' ref={this.autocompleteCont}>
              
            </div>
          </div>
        </div>
      </div>
        
    )
  }
}