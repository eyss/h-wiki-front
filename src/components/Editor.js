/* eslint-disable jsx-a11y/alt-text */
import React, { Fragment } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import { MdClose, 
          MdFindInPage, 
          MdPersonPin, 
          MdImage, 
          MdFileUpload, 
          MdPlayCircleFilled, 
          MdAttachFile } from 'react-icons/md';
import { connect } from 'react-redux';
import { gql } from "apollo-boost";
import Alert from './Alert';

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
      mediaType: undefined,
      mediaTypes: [],
      image: '',
      file: undefined,
      src: '',
      accept: '',
      alert: false,
      alertMsg: '',
      preloaderMsg: '',
      preloader: false,
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
          mediaType = section.type,
          state = {};

      if (mediaType === 'Text') {
        state.content = section.content;
      } else {
        let structure = new DOMParser().parseFromString(section.rendered_content, 'text/html'),
            element = structure.querySelector('body').firstChild,
            src;
        
        if (mediaType === 'File') {
          let file = {};

          src = element.getAttribute('href');
          file.name = element.textContent;
          state = {file};
        } else {
          src = element.getAttribute('src');
        }
        this.setmediaType(mediaType, src)
      }
      state.mediaTypes = [mediaType];
      this.setState(state);
      
    } else {
      this.setState({
        mediaTypes: [
          'Text',
          'Image',
          'Video',
          'File'
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
      mediaType: this.state.mediaType || 'Text',
      content: contents.content,
      renderedContent: contents.renderedContent,
      pos: this.props.pos,
      currentSection: this.props.getContentSection(this.props.pos, this.props.mode),
      timeStamp: parseInt(Date.now()),
      file: this.state.file
    };

    if (this.props.mode === 'edit') {
      this.props.showConfirmation(data);
    } else {
      this.props.updatePageSections(data);
    }
  }

  getContents(){
    let mediaType = this.state.mediaType,
        data = {};

    if (mediaType === 'Text' || !mediaType) {
      data.content = this.mdEditor.getMdValue();
      data.renderedContent = this.mdEditor.getHtmlValue();
    } else {
      data.content = this.state.file;
      switch (mediaType) {
        case 'Image':
          data.renderedContent = `<img src="${this.state.src}" />`;
        break;
  
        case 'Video':
          data.renderedContent = `<video controls src="${this.state.src}">The “video” tag is not supported by your browser. Click [here] to download the video file.</video>`;
        break;
  
        default:
          data.renderedContent = `<a href="${this.state.src}" download="${this.state.file.name}">${this.state.file.name}</a>`;
        break;
      }
    }
    return data;
  }

  setStyleAutoComplete = () =>{
    if ((this.state.mediaType === 'Text' || !this.state.dataTye) && this.editor.current) {
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

  setmediaType(mediaType, src) {
    let accept;

    switch (mediaType) {
      case 'Image':
        accept = 'image/*';
      break;

      case 'Video':
        accept = 'video/*';
      break;

      default:
        accept = '*'
      break;
    }
    this.setState({
      mediaType,
      accept,
      src: src || '',
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
          query: gql` { ${fn} } `
        }).then(m => {
          let matchs = m.data.getPageTitle || m.data.getUsername;
          this.setState({ matchs });
        })
      }
    });
  }

  upLoadFile = async (evt) => {

    this.setState({
      alert: true,
      preloader: true,
      preloaderMsg: 'Uploading ' + this.state.mediaType
    });
    
    var file = evt.target.files[0] || undefined,
        _this = this,
        reader = new FileReader();
  
    reader.onload = function() {
        let state = {};

        if (_this.state.mediaType !== 'File' && _this.state.mediaType.toLowerCase() !== type) {
          let comp = type === 'image' ? 'an ' : 'a ';
          
          state = {
            alertMsg : 'The file is not ' + comp + _this.state.mediaType.toLowerCase(),
            preloader : false,
            preloaderMsg : '',
          };
        } else {
          state = {
            src: this.result,
            file,
            alert: false,
            preloader: false,
            preloaderMsg: ''
          };
        }
        _this.setState(state);
    };

    if (file) {
      var type = file.type.split('/')[0];
      reader.readAsDataURL(file); 
    } else {
      this.setState({
        alert: false,
        preloader: false,
        preloaderMsg: ''
      });
    }
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

  closeAlert = () => {
    this.setState({ alert: false });
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
                    value={this.state.mediaType}
                    onChange={e => {this.setmediaType(e.target.value)}}
                    disabled={this.props.mode === 'edit' ? true : false}
                    >
                    {this.state.mediaTypes.map((optVal, key) =>{
                      return ( 
                        <option key={key} value={optVal}>{optVal}</option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </header>
            <section>

              {(this.state.mediaType === 'Text' || !this.state.mediaType) &&
                <div ref={this.editor} className='hw-editor-container'>
                  <MdEditor
                    ref={node => this.mdEditor = node}  
                    value={this.state.content}
                    renderHTML={(text) => this.mdParser.render(text)}
                  />
                </div>
              }

              {(this.state.mediaType !== 'Text' && this.state.mediaType) &&
                <div className='hw-upLoadFile-container'>

                  <div>
                    <button onClick={ e => { this.imageUploader.current.click() }}>
                      <MdFileUpload /> Upload {this.state.mediaType}
                    </button>
                    <input
                      hidden
                      type="file"
                      name=""
                      id="upload"
                      accept={this.state.accept}
                      ref={this.imageUploader}
                      onChange={e => { this.upLoadFile(e) }}
                    />
                  </div>

                  <div>

                    {(this.state.mediaType === 'Image') &&
                      <Fragment>
                        <div>
                          {this.state.src.length > 0 &&
                            <img src={this.state.src} />
                          }
                        </div>
                        <div>
                          <MdImage /> 
                        </div>
                      </Fragment>
                    }

                    {this.state.mediaType === 'Video' &&
                      <Fragment>
                        <div>
                          {this.state.src.length > 0 &&
                            <video controls src={this.state.src}>
                              The “video” tag is not supported by your browser. Click [here] to download the video file.
                            </video>
                          }
                        </div>
                        <div>
                          <MdPlayCircleFilled />
                        </div>
                      </Fragment>
                    }

                    {this.state.mediaType === 'File' &&
                      <Fragment>
                        <div>
                          {this.state.src.length > 0 &&
                            <a href={this.state.src} download={this.state.file.name}>
                              {this.state.file.name}
                            </a>
                          }
                        </div>
                        <div>
                          <MdAttachFile />
                        </div>
                      </Fragment>
                    }

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
          <Alert
            alert = {this.state.alert}
            alertMsg = {this.state.alertMsg}
            preloaderMsg = {this.state.preloaderMsg}
            preloader = {this.state.preloader}
            closeAlert = {this.closeAlert}
          />
          
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