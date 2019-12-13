import React, { Fragment } from 'react';
import Page from './components/Page';
import { connect } from '@holochain/hc-web-client';
import './styles/App.scss';
import Editor from './components/Editor';
import PreviewSection from './components/PreviewSection';

//ParentA component
class App extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
        arg1: 'default',
        currentURLParemter: [],
        parameters: [],
        titles: [],
        contents: [],
        pages: [],
        hash: '',
        titlenp : 'Titulo prueba en el state',
        contentsnp: [
          {
            parent_page_anchor: "",
            element_type: "text",
            element_content: "Soy un paragrafoo",
            TradHTML: "<p>Soy un paragrafo</p>"
          },
          {
            parent_page_anchor: "",
            element_type: "text",
            element_content: "# Soy un tituloo",
            TradHTML: "<h1>Soy un titulo</h1>"
          },
          {
            parent_page_anchor: "",
            element_type: "text",
            element_content: "## Soy un titulo h2 \n y un parrafo",
            TradHTML: "<h2>Soy un titulo</h2> <p>y un titulo</p>"
          },
          {
            parent_page_anchor: "",
            element_type: "text",
            element_content: "## Soy un titulo h2 2 \n y un parrafo",
            TradHTML: "<h2>Soy un titulo 2</h2>  <p>y un titulo</p>"
          }
        ],
        editorParam: [{
          pos: 1,
          mode: 'undefined'
        }]
      };
  }

  componentDidMount() {
    this.init();
  }
  
  init() {
    var _this = this;
    let hash = window.location.hash,
        param;

    if (!hash.length) {
      param = ['home'];
      window.location.hash = 'home';
    } else {
      param = hash.split('/');
      param[0] = param[0].replace('#', '');
    }

    this.setState({
      currentURLParemter: param,
      parameters: param
    }, function(){
      _this.initRendering();
    });
  }

  initRendering() {
    
    let _this = this,
        urlParemter = this.state.currentURLParemter,
        view = urlParemter[0],
        newURLParemter = urlParemter.slice(1, urlParemter.length);

    if (urlParemter.length !== 0) {
      fetch('/graphql',{
        method: 'POST',
        Accept: 'api_version=2',
        headers:{ 'Content-Type' : 'application/graphql' },
        body: `{getPage(pageId:"${view}"){title,content}}`,
      })
      .then( r => r.json() )
      .then( data => {
        // Reposicionar los elementos, contenido y parametros
        _this.setState({
          page: _this.state.pages.push(<Page handleToUpdate = {this.handleToUpdate.bind(this)} data = {data} />),
          currentURLParemter: newURLParemter
        }, () => {
          _this.initRendering();
        });
      });
    }
  }
  
  handleToUpdate(e){

    var cont = 2,
        link = e.target,
        parent = link.parentNode,
        pos,
        paramURL = link.textContent.replace(/\s/g, '_')      

    for (var i = 0; i<cont; i++) {
      if (parent.dataset.page) {
        pos = parent.dataset.page;
        break
      } 
      parent = parent.parentNode;
      cont+=1;
    }

    let init = parseInt(pos) + 1, 
        end = this.state.pages.length-1;
    
    var x = this.state.pages,
        y = x.splice(init, end);
    
    console.log(y)

    fetch('/graphql',{
      method: 'POST',
      Accept: 'api_version=2',
      headers:{ 'Content-Type' : 'application/graphql' },
      body: `{getPage(pageId:"page"){title,content}}`,
    })
    .then( r => r.json() )
    .then( data => {
      // Reposicionar los elementos, contenido y parametros
      var newIntfz  = <Page handleToUpdate = {this.handleToUpdate.bind(this)} data = {data} />;
      this.setState({
        page: this.state.pages.push(newIntfz),
      }, () => {
        this.initRendering();
      });
    });

  }

  closeModal = () => {    
    document
      .querySelector('#modal-create-page')
        .style.display = 'none';
  }

  showModal = () => {    
    document
      .querySelector('#modal-create-page')
        .style.display = 'flex';
  }

  showEditorModal = () => {    
    document
      .querySelector('#modal-add-section')
        .style.display = 'flex';
  }

  updateTitle = (e)=> {
    this.setState({ titlenp: e.target.value });
  }

  getContentSection(pos=null, mode = null) {
    var content = '';
    if (pos == 0 || pos && mode.toString() === 'edit'){
      if(pos !== undefined) {
        pos = parseInt(pos);
        var element = this.state.contentsnp[pos];
        if (element !== undefined) {
          content = element.element_content;
        }
      }
    }
    return content;
  }

  openEditor = (pos = null, mode) => {
    let options = [{
      pos: pos,
      mode: mode
    }];

    this.setState({
      editorParam: options
    }, function(){
      document
        .querySelector('#modal-add-section')
          .style.display = 'flex';
    })
  }

  saveSection(pos = null) {
    var updatedSections = this.state.contentsnp;
  }

  removeSection = (pos) => {
    var sections = this.state.contentsnp,
        _this = this;

    pos = parseInt(pos);
    
    sections.splice(pos, 1)
    
    this.setState({
      contentsnp: []
    }, function(){
      _this.setState({
        contentsnp: sections
      })
    })
  }

  render() {
    return (
      <div id='container'>
        <header>
          <div>
            <h1>HoloWiki</h1>
          </div>
          <div>
            <button onClick={this.showModal}>Create page</button>
          </div>
        </header>
        <section>
          {this.state.pages.map((page, key)=>{
            return(
              <div key={key} data-page={key} id={key}>
                {page}
              </div>
            )
          })}
        </section>


        <div id='modal-create-page'>
          <div>

            <header>
              <label>Create page</label>
            </header>

            <section>
              <div>
                <input 
                  type='text'
                  value={this.state.titlenp}
                  onChange={this.updateTitle} 
                  placeholder='Page title'
                />
              </div>

              <div>
              
                {this.state.contentsnp.map((data, key) => {
                  return(
                    <PreviewSection 
                      key = {key}
                      pos = {key}
                      content = {data.TradHTML}
                      openEditor = {this.openEditor.bind(this)}

                      removeSection = {this.removeSection.bind(this)}
                      //funcion para elinminar
                      //funcion para editar
                      //funcion para 
                    />
                  )
                })}

              </div>
            </section>

            <footer>

              <div>
                <div>
                  <button onClick={e=>{this.openEditor(null, 'add')}}>Add new section</button>
                </div>
              </div>

              <div>
                <div>
                  <button onClick={this.closeModal}>Cancel</button>
                  <button>Save</button>
                </div>
              </div>

            </footer>
          </div>
        </div>

        <div id='modal-add-section'>
          <div>
              {this.state.editorParam.map((param, key) => {
                return(
                  <Editor
                    key = {key}
                    pos = {param.pos}
                    mode = {param.mode}
                    getContentSection = {this.getContentSection.bind(this)}
                    saveSection = {this.saveSection.bind(this)}
                  />
                )
              })}
          </div>
        </div>
      </div>
    )
  }
}


export default App;
