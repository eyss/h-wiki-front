/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import { MdClose, MdFindInPage, MdPersonPin, MdImage, MdFileUpload } from 'react-icons/md';
import { connect } from 'react-redux';
import { gql } from "apollo-boost";
import Compress from 'compress.js'

class Editor extends React.Component {
  mdEditor = null;
  mdParser = null;
  constructor(props) {
    super(props);
    this.state = {
      data: '',
      content: '',
      displayAC: 'hidden',
      searchAlt: 'page',
      textarea: undefined,
      matchs: [],
      dataType: undefined,
      dataTypes: [],
      image: '',
    };
    this.mdParser = new MarkdownIt();
    this.editor = React.createRef();

    this.autocompleteCont = React.createRef();
    this.input = React.createRef();
    this.imageUploader = React.createRef();
  }
  
  componentDidMount() {

    if (this.props.mode === 'edit' ) {
      let section = this.props.getContentSection(this.props.pos, this.props.mode),
          state= {},
          dataType = section.type;
          
      if(dataType === 'Text') {
        state.content = section.content;
      } else if (dataType === 'Image' || dataType === 'SVG') {
        let img = new DOMParser().parseFromString(section.rendered_content, 'text/html');
        state.image = img.querySelector('img').getAttribute('src');
      }

      state.dataType = dataType;
      state.dataTypes = [dataType];
      this.setState(state);
    } else {
      this.setState({
        dataTypes: [
          'Text',
          'Image',
          'SVG',
          'Video',
          'File',
        ]
      });
    }

    const editor = this.editor.current;

    editor.addEventListener('click', (e)=>{
      if (e.target.nodeName === 'A') { e.preventDefault(); }
    });

    this.setStyleAutoComplete();
    window.addEventListener('resize', ()=>{ this.setStyleAutoComplete(); });
    
    const textarea = editor.querySelector('#textarea');
    this.testTextarea(textarea);
    this.setState({ textarea: textarea });
  }

  updatePageSections = () => {
    let contents = this.getContents(),
    data = {
      process: 'update',
      mode: this.props.mode,
      dataType: this.state.dataType || 'Text',
      content: contents.content,
      renderedContent: contents.renderedContent,
      pos: this.props.pos,
      currentSection: this.props.getContentSection(this.props.pos, this.props.mode),
      timeStamp: parseInt(Date.now())
    };

   if (this.props.mode === 'edit') {
      this.props.showConfirmation(data);
    } else {
      this.props.updatePageSections(data);
    }
  }

  getContents(){
    let dataType = this.state.dataType,
        data = {
          content: undefined,
          renderedContent: undefined,
        };

    if (dataType === 'Text' || !dataType) {
      data.content = this.mdEditor.getMdValue();
      data.renderedContent = this.mdEditor.getHtmlValue();
    }

    if (dataType === 'Image') {
      data.content = `![](${this.state.image})`;
      data.renderedContent = `<img src="${this.state.image}" />`;
    }
    return data;
  }

  setStyleAutoComplete = ()=>{
    if (this.state.dataType === 'Text' || !this.state.dataTye) {
      const textarea = this.editor.current.querySelector('#textarea'),
          cordinates = textarea.getBoundingClientRect(),
          { width, height, left, top } = cordinates,
          style = `width: ${width}px; height: ${height}px; left: ${left}px; top: ${top}px;`;

      this.autocompleteCont
        .current.setAttribute('style', style);
    }
  }

  showAutoComplete(alt) {
    this.setState({
      searchAlt: alt,
      displayAC: 'show',
      data: '',
      matchs: []
    }, (_this = this) =>{
      _this.input.current.focus();
    });
  }

  closeAutoComplete = ()=> {
    this.setState({
      displayAC: 'hidden'
    });
  }

  setRefContent = (e) => {
    let iCont,
        fCont,
        ref = `[${e.target.textContent}]()`,
        cursorPos = this.state.posCText,
        currentContent = this.mdEditor.getMdValue(),
        content = '';
      
    // Referencia
    if (this.state.searchAlt !== 'page') {
      ref = `**@${e.target.textContent}** `;
    }
    
    if(cursorPos === 0) {
      content = ref + content;
    } else if(cursorPos === content.length) {
      content = content + ref;
    } else {
      iCont = currentContent.substring(0, cursorPos);
      fCont = currentContent.substring((cursorPos+1), currentContent.length)
      content = iCont + ref + fCont;
    }
    this.setState({ content },
      (_this = this) => {
      _this.closeAutoComplete();
    });
  }

  setDataType(e) {
    this.setState({
      dataType: e.target.value
    });
  }

  setData = (e) => {
    this.setState({
      data: e.target.value
    }, (data=this.state.data)=>{
      let fn = this.state.searchAlt === 'page' ?
              `getPageTitle(title:"${data}") ` :
              `getUsername(username:"${data}")`;

      if (data.length>=3) {
        this.props.client
        .query({
          query: gql`
            {
              ${fn}
            }
          `
        }).then(m => {
          let matchs = m.data.getPageTitle || m.data.getUsername;
          console.log(m);
          this.setState({
            matchs: ['page-0', 'page-1', 'page-2', 'page-3']
          });
        })
      }
    });
  }

  upLoadImage = (evt) => {
    const compress = new Compress(),
          files = [...evt.target.files];

    compress.compress(files, {
      size: 4,
      quality: 0.75,
      maxWidth: 1920,
      maxHeight: 1920,
      resize: true
    }).then((data) => {
      const image = data[0].prefix + data[0].data;
      this.setState({
        image
      });
    })
  }

  testTextarea(textarea){
    textarea.addEventListener('click', (e)=>{
      this.setState({posCText: this.getCursorPos(textarea).start});
    });

    textarea.addEventListener('keypress', (e)=>{
      this.setState({
        posCText: this.getCursorPos(textarea).start
      }, (_this = this) =>{
        if (e.key === '/' || e.key === '@') {
          _this.showAutoComplete(e.key === '/' ? 'page': 'username')
        }
      });
    });
  }

  getCursorPos = (input) => {
    if ("selectionStart" in input && document.activeElement === input) {
      return {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    }
    else if (input.createTextRange) {
      var sel = document.selection.createRange();
      if (sel.parentElement() === input) {
        var rng = input.createTextRange();
        rng.moveToBookmark(sel.getBookmark());
        for (var len = 0; rng.compareEndPoints("EndToStart", rng) > 0; rng.moveEnd("character", -1)) {
          len++;
        }
        rng.setEndPoint("StartToStart", input.createTextRange());
        for (var pos = { start: 0, end: len }; rng.compareEndPoints("EndToStart", rng) > 0; rng.moveEnd("character", -1)) {
          pos.start++;
          pos.end++;
        }
        return pos;
      }
    }
    return -1;
  }

  render() {
    return (
      <div id='editor'>
        <div>
          <div id="rmel-container">
            <header>
              <div>
                <label>Content section</label>
              </div>
              <div>
                <div>
                  <label>Content type:</label>
                </div>
                <div>
                  <select
                    value={this.state.dataType}
                    onChange={e => {this.setDataType(e)}}
                    disabled={this.props.mode === 'edit' ? true : false}
                    >
                    {this.state.dataTypes.map((optVal, key) =>{
                      return ( 
                        <option key={key} value={optVal}>{optVal}</option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </header>
            <section>

              {(this.state.dataType === 'Text' || !this.state.dataType) &&
                <div ref={this.editor} className='hw-editor-container'>
                  <MdEditor
                    ref={node => this.mdEditor = node}  
                    value={this.state.content}
                    renderHTML={(text) => this.mdParser.render(text)}
                  />
                </div>
              }

              {this.state.dataType === 'Image' &&
                <div className='hw-uploadImage-container'>

                  <div>
                    <button onClick={ e => { this.imageUploader.current.click() }}>
                      <MdFileUpload /> Upload image
                    </button>

                    <input
                      hidden
                      type="file"
                      name=""
                      id="upload"
                      accept="image/*"
                      ref={this.imageUploader}
                      onChange={e => { this.upLoadImage(e) }}
                    />
                  </div>

                  <div>
                    <div>
                      <img src={this.state.image} />
                    </div>
                    <div>
                      <MdImage />
                    </div>
                  </div>

                </div>
              }

            </section>

            <footer>
              <div>
                <button onClick={e =>{ this.props.closeEditor() }}>Cancel</button>
                <button onClick={this.updatePageSections}>{this.props.mode === 'edit' ? 'Update' : 'Save'}</button>
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
                      value={this.state.data}
                      onChange={this.setData}
                    />
                  </div>
                  <div>
                    <ul>
                      {
                        this.state.matchs.map((val, key) =>{
                          return (
                            <li onClick={this.setRefContent} key={key}>{val}</li>
                          )
                        })
                      }
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

function mapDispatchToProps(dispatch) {
  return {};
}

function mapStateToProps(state) {
  return {
    client: state.client,
    userId: state.userId
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)