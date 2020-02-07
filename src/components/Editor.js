import React from 'react';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import { MdClose, MdFindInPage, MdPersonPin } from 'react-icons/md';
import { connect } from 'react-redux';
import { gql } from "apollo-boost";


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
      matchs: []
    };
    this.mdParser = new MarkdownIt();
    this.editor = React.createRef();

    this.autocompleteCont = React.createRef();
    this.input = React.createRef();
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

  render() {
    let txtBtn = this.props.mode === 'edit' ? 'Update' : 'Save';

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
                value={this.state.content}
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