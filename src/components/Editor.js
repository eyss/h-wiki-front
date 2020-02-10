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
      dataType: 'Text',
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
      this.setState({
        content: this.props.getContentSection(this.props.pos, this.props.mode).content 
      });
    }

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

      if ((lastChar === '/' || lastChar === '@') && !((e.keyCode>= 37 && e.keyCode <= 40) || (e.keyCode === 8))) {
        this.showAutoComplete(lastChar === '/' ? 'page': 'username')
      }
    });
  }

  updatePageSections = () => {

    const content = this.state.dataType === 'Text' ?
                    this.mdEditor.getMdValue() : 
                    `![](${this.state.image})`;

   if (this.props.mode === 'edit') {
      this.props.showConfirmation({
        process: 'update',
        pos: this.props.pos,
        mode: this.props.mode,
        content: content,
        currentSection: this.props.getContentSection(this.props.pos, this.props.mode)
      });
    } else {
      this.props.updatePageSections(
        this.props.mode,
        this.props.pos,
        content,
        this.props.getContentSection(this.props.pos, this.props.mode)
      );
    }
  }
  
  close = () => {    
    this.props.closeEditor();
  }

  setStyleAutoComplete = ()=>{
    if (this.state.dataType === 'Text') {
      const textarea = this.editor.current.querySelector('#textarea'),
          cordinates = textarea.getBoundingClientRect(),
          { width, height, left, top } = cordinates,
          style = `width: ${width}px; height: ${height}px; left: ${left}px; top: ${top}px;`;

      this.autocompleteCont
        .current.setAttribute('style', style);
    }
  }

  showAutoComplete(alt) {
    console.log(alt);
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
    }, (_this = this)=>{
      _this.state.textarea.focus();
    });
  }

  setRefContent = (e) => {
    var textarea = this.state.textarea,
      content = textarea.value,
      l = content.length,
      ref = `[${e.target.textContent}]() `,
      bfstr;

    content = content.substr(0, (l-1));

    bfstr = /\n$/.test(content) ? '\n' : '';
    
    if (this.state.searchAlt !== 'page') {
      ref = `**@${e.target.textContent}** `;
    }
    
    content = content + bfstr + ref;

    this.setState({ content },
      (_this = this) => {
        _this.closeAutoComplete();
      }
    );
  }

  setDataType(e) {
    console.log(e.target.value);
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
          this.setState({
            matchs
          });
        })
      }
    });
  }

  upLoadImage = (evt) => {
    const compress = new Compress();

    const files = [...evt.target.files];

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

  render() {
    let txtBtn = this.props.mode === 'edit' ? 'Update' : 'Save';

    return (
      <div id='editor'>
        <div>
          <div id="rmel-container">
            <header>
              <div>
                <label>Content section | {this.state.dataType}</label>
              </div>
              <div>
                <div>
                  <label>Content type:</label>
                </div>
                <div>
                  <select value={this.state.dataType}  onChange={e => {this.setDataType(e)}}>
                    <option value="Text">Text</option>
                    <option value="Image">Image</option>
                    <option disabled>SVG</option>
                    <option disabled>Video</option>
                    <option disabled>File</option>
                  </select>
                </div>
              </div>
            </header>
            <section>

              {this.state.dataType === 'Text' &&
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