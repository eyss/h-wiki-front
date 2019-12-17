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
        currentURLParemter: [],
        parameters: [],
        titles: [],
        contents: [],
        pages: [],
        hash: '',
        titlenp : '',
        contentsnp: [],
        editorParam: [{
          pos: 1,
          mode: 'undefined'
        }],
        renderedPages: [],
        links: [],
        addresses: []
      };
  }

  componentDidMount() {
    var _this = this;
    console.log('Component did mount');
    connect({ url: "ws://192.168.1.63:8888" }).then(({callZome, close}) => {
        callZome('wiki', 'wiki', 'get_pages_address') ({})
        .then( addresses => {
          addresses = JSON.parse(addresses);
          addresses = addresses.Ok;
          this.setState({
            addresses : addresses
          }, ()=>{
            _this._initRenderig();
          });
        })
    })
  }

  _initRenderig() {
    if (!this.state.addresses.length) {

      var contentLinks = this.state.links,
          arrLinks = [];
          
      for(var i in contentLinks) {
        arrLinks[i] = `* [${contentLinks[i].content}](${contentLinks[i].href})\n`;
      }

      var data = {
        title: `## Pages: \n`,
        address: undefined,
        sections: [{
          content: arrLinks.join(' '),
          address: undefined
        }],
      };
      var pages = [<Page handleToUpdate = {this.handleToUpdate.bind(this)} data = {data} />];
      this.setState({
        pages: pages
      })
    } else {
      var _this = this;
      connect({ url: "ws://192.168.1.63:8888" }).then(({callZome, close}) => {
        callZome('wiki', 'wiki', 'get_all') ({
          address:  this.state.addresses[0]
        })
        .then( pageData => {
          pageData = JSON.parse(pageData);
          pageData = pageData.Ok;
          console.clear();
          console.log(pageData);
          var link = {};
          link.content = pageData.page.titulo;
          link.href = pageData.page_name;
        
          var links = this.state.links;
          links[links.length] = link;
          this.setState({
            links : links,
            addresses: this.state.addresses.splice(1, this.state.addresses.length)
          }, () => {
            _this._initRenderig();
          });
        });
    });
    }
  }
    
  handleToUpdate(e){
    e.preventDefault();
    let el = e.target,
        link = el.href.split('/'),
        address = link[link.length-1],
        cont = 2,
        parent = el.parentNode,
        pos;
   
    for (var i = 0; i<cont; i++) {
      if (parent.dataset.page) {
        pos = parent.dataset.page;
        break
      } 
      parent = parent.parentNode;
      cont+=1;
    } 

    var currentPages = this.state.pages;
    currentPages.splice((parseInt(pos)+1), currentPages.length-1);

    connect({ url: "ws://192.168.1.63:8888" }).then(({callZome, close}) => {
        callZome('wiki', 'wiki', 'get_all') ({
          address: address
        })
        .then( page => {
          page = JSON.parse(page);
          page = page.Ok;

          var data = {
            title: page.page.titulo,
            address: page.page_name,
            sections: []
          };
          var cSections = page.redered_page_element;

          for(var j in cSections) {
            data.sections[j] = {};
            data.sections[j].content = cSections[j].element_content;
            data.sections[j].render = cSections[j].element_content;
            data.sections[j].address = page.vector_address[j]
          }
          
          var renderedPages = [data];
          // console.log(renderedPages)
          var updatedPages = [...currentPages, <Page handleToUpdate = {this.handleToUpdate.bind(this)} data = {data} />]
          this.setState({
            pages: updatedPages,
            renderedPages: [...this.state.renderedPages, renderedPages]
          })
        })
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
    if (pos === 0 || pos && mode.toString() === 'edit'){
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

  updateSectionPage(pos, content, mode = null) {

    var section = {
      parent_page_anchor: "",
      element_type: "text",
      element_content: content.markdown,
      render: content.markdown
    },
    contentsnp = this.state.contentsnp,
    _this = this,
    pEnd;

    if (mode === 'addSB' || mode === 'add') {
      pos = mode === 'add' ? contentsnp.length : (parseInt(pos)+1);
      pEnd=0;
    } else if (mode === 'edit') {
      pEnd=1;
    }
    contentsnp.splice(pos, pEnd, section);
    this.setState({
      contentsnp: []
    }, function() {
      _this.setState({
        contentsnp: contentsnp
      }, function(){
        document
          .querySelector('#modal-add-section')
            .style.display = 'none';
      })
    })
    console.log(mode);
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

  storePage = () => {
    var _this = this;
    connect({ url: "ws://192.168.1.63:8888" }).then(({callZome, close}) => {
        callZome('wiki', 'wiki', 'create_page_with_elements') ({
          titulo: _this.state.titlenp,
          contents: _this.state.contentsnp
        })
        .then( r => {
          console.log(r)
          _this.setState({
            titlenp: '',
            contentsnp: []
          }, () => {
            _this.closeModal();
          });
        })
    })
  }

  showPageRendered = (e) => {
    var pos = (parseInt(e.target.dataset.posSect)-1);
    var page = this.state.renderedPages[pos][0];
    var _this = this;
    this.setState({
      titlenp: page.title,
      contentsnp: page.sections, 
    }, () => {
      _this.showModal();
    })
  }

  render() {
    return (
      <div id='container'>
        <header>
          <div>
            <label>HoloWiki</label>
          </div>
          <div>
            <button onClick={this.showModal}>Create page</button>
          </div>
        </header>
        <section>
          {this.state.pages.map((page, key)=>{
            return(
              <div key={key} data-page={key} id={key}>
                <div>
                  <button onClick={this.showPageRendered} data-pos-sect={key}>Editar</button>
                </div>
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
                      content = {data.render}
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
                  <button>Delete page</button>

                </div>
              </div>

              <div>
                <div>
                  <button onClick={this.closeModal}>Cancel</button>
                  <button onClick={this.storePage}>Save</button>
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
                    updateSectionPage = {this.updateSectionPage.bind(this)}
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
