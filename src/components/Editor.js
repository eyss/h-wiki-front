import React from 'react';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import { MdClose, MdFindInPage, MdPersonPin } from 'react-icons/md';

export default class Editor extends React.Component {
  mdEditor = null;
  mdParser = null;
  constructor(props) {
    super(props);
    this.state = {
      displayAC: 'hidden',
      searchAlt: 'page',
      textarea: undefined
    };
    this.mdParser = new MarkdownIt();
    this.editor = React.createRef();

    this.autocompleteCont = React.createRef();
    this.input = React.createRef();
  }
  
  componentDidMount() {
    const editor = this.editor.current;

    editor.addEventListener('click', (e)=>{
      if (e.target.nodeName === 'A') { e.preventDefault(); }
    });

    this.setStyleAutoComplete();
    window.addEventListener('resize', ()=>{ this.setStyleAutoComplete(); });
    
    const textarea = editor.querySelector('#textarea');
    this.setState({ textarea: textarea });

    textarea.addEventListener('keyup', (e)=>{
      let str = e.target.value,
          l = str.length,
          lastChar = str.substr((l-1), l);
            
      if (lastChar === '/' || lastChar === '@') {
        this.showAutoComplete(lastChar === '/' ? 'page': 'username')
      }
    });
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

  setStyleAutoComplete(){
    const textarea = this.editor.current.querySelector('#textarea'),
        cordinates = textarea.getBoundingClientRect(),
        { width, height, left, top } = cordinates,
        style = `width: ${width}px; height: ${height}px; left: ${left}px; top: ${top}px;`;

    this.autocompleteCont
      .current.setAttribute('style', style);
  }

  showAutoComplete(alt) {
    console.log(alt);
    this.setState({
      searchAlt: alt,
      displayAC: 'show'
    }, (_this = this) =>{
      _this.input.current.focus();
    });
  }

  closeAutoComplete = ()=> {
    this.setState({
      displayAC: 'hidden'
    }, (_this = this)=>{
      _this.state.textarea.focus();
    });
  }

  render() {
    
    var content = '', txtBtn = 'Save';
    if (this.props.mode === 'edit') {
      content = this.props.getContentSection(this.props.pos, this.props.mode).content;
      txtBtn = 'Update';
    }
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

            <div className={'autocomplete-cont ' + this.state.displayAC} ref={this.autocompleteCont}>
              <div>
                <div>
                  <div>
                    <button onClick={this.closeAutoComplete}>
                      <MdClose />
                    </button>
                  </div>
                  <div>
                    <div>
                      {
                        this.state.searchAlt === 'page' ?
                        <MdFindInPage /> : 
                        <MdPersonPin />
                      }
                    </div>
                    <input
                      placeholder={`Insert ${this.state.searchAlt}`}
                      ref={this.input}
                    />
                  </div>
                  <div>
                    <ul>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                      <li>a page</li>
                    </ul>
                  </div>
                </div> 
              </div>
            </div>

          </div>
        </div>
      </div>
        
    )
  }
}