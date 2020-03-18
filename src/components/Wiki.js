import React from 'react';
import Page from './Page';
import Navbar from './Navbar';
import Editor from './Editor';
import PreviewSection from './PreviewSection';
import Alert from './Alert';

import { MdCreate, MdAdd, MdClose } from "react-icons/md";
import { connect } from 'react-redux';
import { uploadFile, fetchFile } from 'holochain-file-storage';

/** Apollo cliente, GraphQL */
import { gql } from "apollo-boost";

class Wiki extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        existingPages: [],
        pages: [],
        newData: {
          title: '',
          sections: [
          ]
        },
        statusPreload: '',
        pageData: {
          title: '',
          sections: [],
          position: undefined
        },
        existingPage: false,
        editorSettings: [],
        pageDataProcess: {},
        previewData: {},
        clearingCache: false,
        //Global variable for content show
        showPageManager: false,
        showEditor: false,
        alert: false,
        confirmation: false,
        confirmationMsg: 'equis',
        preloader: false,
        loadingPage: true,

        resolve: null,
        rslvUM: null,
        scssUploadMedia: null,
        refreshing: false
      };

      this.pagesContainer = React.createRef();
      this.pageStructure = `
        title
        sections {
          id
          type
          content
          rendered_content
        }
      `;
    }

    componentDidMount() {
      this.props.client
        .query({
          query: gql`
            {
              allPages {
                title
              }
            }
          `
        })
        .then(pages =>{
          pages = pages.data.allPages;
          let homePage = { title: 'Homepage' };
          if (!pages.length) {
            homePage.renderedContent = 'No pages have been created';
            homePage.links = false;
          } else {
            homePage.renderedContent = this.linkFormatter(pages);
            homePage.links = pages;
          }
          this.setState({
            pages: [homePage],
            loadingPage: false
          });
        })
        .catch(e => console.log("object", e));
    }

    refreshLinks = async () => {
      if (!this.state.refreshing) {
        await this.props.client.resetStore(); 
        this.setState({ loadingPage: true,  refreshing: true });
        var pages = this.stateAssignment(this.state.pages);
        await this.props.client
        .query({
          query: gql`
            {
              allPages {
                title
              }
            }
          `
        })
        .then(_pages =>{
          console.log('Pages of refresh', _pages);
          _pages = _pages.data.allPages;
          let homePage = { title: 'Homepage' };
          if (!_pages.length) {
            homePage.renderedContent = 'No pages have been created';
            homePage.links = true;
          } else {
            homePage.renderedContent = this.linkFormatter(_pages);
            homePage.links = _pages;
          }
          pages.splice(0,1, homePage);
          this.setState({
            pages,
            loadingPage: false,
            refreshing: false
          });
        })
        .catch(e => console.log("object", e));
      }
    }

    async getMedia(address, typeMedia) {
      console.log(typeMedia);
      const file = await fetchFile(this.props.callZome, '__H_Wiki')(address);
      var media;

      await new Promise((resolve, reject) =>{
        let reader = new FileReader();
        reader.onload = function() {
          resolve(this.result);
        }
        reader.readAsDataURL(file);
      })
      .then(src => {
        switch (typeMedia) {
          case 'Image':
            media = `<img src="${src}" />`;
          break;

          case 'Video':
            media = `<video autoPlay controls src="${src}">
              The "video" tag is not supported by your browser. Click [here] to download the video file.
            </video>`;
          break;

          default:
            media = `<a href="${src}" download="${file.name}">${file.name}</a>`;
          break;
        }
      });
      return media;
    }

    async showPage(e){
      e.preventDefault();
      var page, sections, media;
      this.setState({loadingPage: true})
      await this.props.client
      .query({
        query: gql`
          {
            page(title:"${e.target.textContent}") {
              ${this.pageStructure}
            }
          }
        `
      })
      .then(_page => {
        page = _page;
      }).catch(e=>{
        this.setState({
          loadingPage: false
        })
      });

      page = page.data.page;
      sections = page.sections;
      for (var i in sections) {
        if (sections[i].type !== 'Text') {
          media = await this.getMedia(sections[i].content, sections[i].type);
          page.sections[i].rendered_content = media;
        }
      }
      page.renderedContent = this.sectionContentFormatter(page.sections);

      var pages = this.state.pages;
      pages.splice(this.getPagePositionPage(e) + 1, pages.length);
      pages = [...pages, page];
      this.setState({
        pages,
        loadingPage: false
      }, (_this=this) => {
        _this.pagesContainer.current.scrollTo(parseInt(Math.random().toString().substring(2, 10)), 0);
      });
    }

    uploadMedia = (sections) => {
      return new Promise( async (resolve, reject) => {

        if (this.state.rslvUM === null) {
          var originResolve = resolve;
          await new Promise((resolve, reject) =>{
            this.setState({ rslvUM: originResolve }, function(){
              resolve(true);
            });
          }).then(result => { });
        }

        for (var i in sections) {
          if (!sections[i].uploaded) {
            var section = sections[i];
            break;
          }
        }
      
        if (section.type !== "Text") {
          const fileAddress = await uploadFile(this.props.callZome, '__H_Wiki')(section.content);
          sections[i].content = fileAddress;
          sections[i].rendered_content = 'uploaded';
        }

        sections[i].uploaded = true;
        if (parseInt(i) === (sections.length-1)) {
          this.state.rslvUM(sections);
        } else {
          this.uploadMedia(sections);
        }
      })
    }

    storePage = async () => {
      this.setState({
        alert: true,
        preloader: true,
        preloaderMsg: 'storing page'
      });
      var sections = [];
      await this.uploadMedia(this.state.pageData.sections)
      .then(_sections => {
        console.log(_sections);
        this.setState({ rslvUM:null });
        sections = _sections;
        console.log('Resultado de la subida de archivos ', sections);
      });

      for (let i in sections) {
        delete sections[i].uploaded;
      }
      
      this.state.pageData.sections = sections;

      console.log('PageData', this.state.pageData.sections);

      await this.props.client
        .mutate({
          mutation: gql`
            mutation CreatePageWithSections(
              $title: String!
              $sections: [SectionInput!]!
            ) {
              createPageWithSections(title: $title, sections: $sections) {
                ${this.pageStructure}
              }
            }
          `,
          variables: { title: this.state.pageData.title, sections: this.state.pageData.sections }
        })
        .then(e => {
          var pages = this.stateAssignment(this.state.pages),
              links = pages[0].links,
              link = [{title: this.state.pageData.title}];

          if (typeof(links) === 'boolean') {
            pages[0].renderedContent = this.linkFormatter(link);
            pages[0].links = link;
          } else {
            pages[0].renderedContent = this.linkFormatter(links.concat(link));
          }

          this.setState({
            pages,
            preloader: false,
            alert: false
          }, (_this=this)=>{
            _this.closePageManager();
          });
        });
    }

    showEditor = (mode, pos = undefined) => {
      this.setState({
        editorSettings: [{
          mode: mode,
          pos: pos
        }]
      }, (_this=this)=>{
        _this.setState({ showEditor: true })
      });
    }

    closeEditor(){
      var state = {showEditor: false};

      if (this.state.alert) { state.alert = false; }
      if (this.state.preloader) { state.preloader = false; }
      if (this.state.confirmation) { state.confirmation = false; }

      this.setState({
        editorSettings: []
      }, (_this=this)=>{
        _this.setState(state)
      });
    }

    showPageManager = () => { this.setState({ showPageManager: true }); }
    closePageManager = () => { this.setState({ showPageManager: false }); }

    createPage = () =>{
      var _this = this;
      this.setState({
        pageData: {
          title: '',
          sections: [],
          position: undefined
        },
        existingPage: false,
      }, ()=> {
        _this.showPageManager();
      });
    }

    showPageData = (pos) => {
      var currentPage = this.stateAssignment(this.state.pages[pos]),
        _this = this;
      currentPage.position = pos;
      console.log('Data for previous section ', currentPage);
      this.setState({
        pageData: currentPage,
        existingPage: true
      }, ()=> {
        _this.showPageManager();
      });
    }

    getPagePositionPage = (e)=> {
      let el = e.target,
          parent = el.parentNode,
          cont = 2,
          pos;
      for (var i = 0; i<cont; i++) {
        if (parent.dataset.page) {
          pos = parent.dataset.page;
          break
        }
        parent = parent.parentNode;
        cont+=1;
      }
      return parseInt(pos);
    }

    updatePageTitle = (e)=> {
        let pageData = this.state.pageData;
        pageData.title = e.target.value;
        this.setState({ pageData: {...pageData} });
    }

    getContentSection = (pos) =>{
      return this.state.pageData.sections[pos];
    }

    stateAssignment(state){
      var newState = JSON.stringify(state);
      return JSON.parse(newState);
    }

    verifySectionsUpdated = async (param) => {
      var title = param.title,
          page = {
            title: title,
            sections: []
          };
      await this.props.client.resetStore();
      return await new Promise((resolve, reject) => {
        if (!this.state.resolve) {
          this.setState({ resolve })
        }
        this.props.client
        .query({
          query: gql`
            {
              page(title:"${title}") {
                sections {
                  id
                  type
                  content
                  rendered_content
                }
              }
            }
          `
       })
       .then(res => {
          let sections = res.data.page.sections;
          if (param.method === 'addns') {
            if (sections.length > 0) {
              page.sections = sections;
              this.state.resolve(page);
            } else {
              this.verifySectionsUpdated(param);
            }
          } else if (param.method === 'addsb' || param.method === 'addsa') {
            if (sections.length > param.sections.length) {
              page.sections = sections;
              this.state.resolve(page);
            } else {
              this.verifySectionsUpdated(param);
            }
          }
        })
        .catch(e => e)
      })
    }

    async updatePageSections(data) {
      let state = {},
          section = {
            type: data.mediaType,
            content: data.content,
            rendered_content: data.renderedContent,
            timestamp: data.timeStamp
          },
          pageData = this.state.pageData,
          secitonUpdated,
          mode = data.mode,
          pos = data.pos,
          currentSection = data.currentSection;

      if (this.state.existingPage) {
        
        this.setState({
          alert: true,
          preloader: true,
        });
        var pages = this.stateAssignment(this.state.pages);

        // console.log(new Date());
        // console.log(file);
        // const { callZome } = await hcConnect({ url: 'ws://192.168.1.63:3400' });

        // console.log('CallZome importado ', callZome);
        // console.log('Cliente redux ', this.props.client);
        // const fileAddress = await uploadFile(callZome, '__H_Wiki')(file);

        // console.log('Archivo cargado');
        // console.log(new Date());
        // console.log(fileAddress);

        // const getf = await fetchFile(callZome, '__H_Wiki')(fileAddress);
        // console.log('Get file');
        // console.log(new Date());
        // console.log(getf);
        /**
          content: undefined
          renderedContent: undefined
        */
        if (data.mediaType !== 'Text') {
          const fileAddress = await uploadFile(this.props.callZome, '__H_Wiki')(data.file);
          data.content = fileAddress;

          section.content = fileAddress;
          section.rendered_content = '';


          console.log('Data ', data);
          console.log('Section ', section);
        }
        
  
        if (mode === 'addns') {
          /**
          * This condition does not run because when you delete all 
          * sections of a page, the application stops working, 
          * so you cannot add a new section.
          */
          this.setState({preloaderMsg: 'Adding section to the page'});
          await this.props.client
          .mutate({
            mutation: gql`
              mutation addSectionToPage(
                $title: String!
                $section: SectionInput!
              ) {
                addSectionToPage(title: $title, section: $section) {
                  ${this.pageStructure}
                }
              }
            `,
            variables: {title: pageData.title, section: section}
          })
          .then(res =>{ });  
        } else if (mode === 'addsb' || mode === 'addsa') {
          this.setState({preloaderMsg: 'Adding section to the page'});
          var sections = [];
          for (let i in pageData.sections) {
              sections.push(pageData.sections[i].id);
          }
          await this.props.client
          .mutate({
            mutation: gql`
              mutation addOrderedSectionToPage(
                $title: String!
                $beforeSection: ID!
                $section: SectionInput!
                $sections: [ID!]!,
                $mode: String!
              ) {
                addOrderedSectionToPage(
                  title: $title,
                  beforeSection: $beforeSection,
                  section: $section,
                  sections: $sections,
                  mode: $mode
                ) {
                  ${this.pageStructure}
                }
              }
            `,
            variables: {
              title: pageData.title,
              beforeSection: pageData.sections[pos].id,
              section,
              sections,
              mode
            }
          })
          .then(res => { });
        } else if (mode === 'edit') {
          this.setState({preloaderMsg: 'Updating section to the page'});
  
          await this.props.client
          .mutate({
            mutation: gql`
              mutation UpdateSection(
                $id: ID!
                $section: SectionInput!
              ) {
                updateSection(id: $id, section: $section) {
                  id
                  type
                  content
                  rendered_content
                }
              }
            `,
            variables: { id: currentSection.id, section: {
              type: data.mediaType,
              content: data.content,
              rendered_content: data.renderedContent,
              timestamp: parseInt(Date.now())
            }}
          })
          .then(res => {
            secitonUpdated = currentSection;
            secitonUpdated.type = data.mediaType;
            secitonUpdated.content = data.content;
            secitonUpdated.rendered_content = data.renderedContent;
            pageData.sections.splice(pos, 1, secitonUpdated);
            pageData.renderedContent = this.sectionContentFormatter(pageData.sections);
            pages.splice(pageData.position, 1, pageData);
            state = {
              pageData,
              pages
            };
          });
          await this.props.client.resetStore();
        }

        if (mode !== 'edit') {
          await this.verifySectionsUpdated({
            title: pageData.title,
            sections: pageData.sections,
            method: mode
          }).then(_page => {
            this.setState({ resolve: null });
            var updatedPage = _page
            updatedPage.renderedContent = this.sectionContentFormatter(updatedPage.sections);
            pages.splice(pageData.position, 1, updatedPage);
            updatedPage.position = pageData.position;
            state = {
              pageData: updatedPage,
              pages
            };
          }).catch(e => e);
        }
      } else {

        if (mode === 'addns') {
          pageData.sections.push(section);
          state = {pageData};
  
        } else if (mode === 'addsb' || mode === 'addsa') {
          if (mode === 'addsb') {
            pageData.sections.splice((pos+1), 0, section);

          } else {
            let sectionsUpdate;
            sectionsUpdate = [section, ...pageData.sections];
            pageData.sections = [];
            pageData.sections = sectionsUpdate;
  
          }
  
          state = {pageData};
  
        } else if (mode === 'edit') {

          pageData.sections.splice(pos, 1, section);
          state = { pageData };
          state.alert = false;
        }
      }

      this.setState(state, (_this=this)=>{
        _this.closeEditor();
      });
    }

    async removeSection(pos) {
      var pageData = this.stateAssignment(this.state.pageData),
          pages = this.stateAssignment(this.state.pages),
          state;

      if (this.state.existingPage) {

        this.setState({
          preloader: true,
          preloaderMsg: 'removing section'
        });

        await this.props.client
        .mutate({
          mutation: gql`
            mutation removeSection(
              $id: ID!
            ) {
              removeSection(id: $id) {
                ${this.pageStructure}
              }
            }
          `,
          variables: { id: pageData.sections[pos].id}
        })
        .then(res => {

          pageData.sections.splice(pos, 1);
          pageData.renderedContent = this.sectionContentFormatter(pageData.sections);
          pages.splice(pageData.position, 1, pageData);

          state = {
            pageData,
            pages
          };
        });
      } else {
        pageData.sections.splice(pos, 1);
        state = {
          pageData
        };
      }

      await this.props.client.resetStore();

      this.setState(state, (_this=this)=>{
        var _state = {alert: false};
        if (_this.state.existingPage) {
          _state.preloader = false;
        }
        _this.setState(_state);
      });
    }

    showConfirmation(pageDataProcess) {
      this.setState({
        alert: true,
        confirmation: true,
        confirmationMsg: 'Are you sure you want to '+ pageDataProcess.process +' this?',
        pageDataProcess
      });
    }

    processPageData = () =>{
      this.setState({
        confirmation: false
      }, (_this=this, pageDataProcess = this.state.pageDataProcess)=>{
        if (pageDataProcess.process === 'update') {
          _this.updatePageSections(pageDataProcess);
        } else if (pageDataProcess.process === 'remove') {
          _this.removeSection(pageDataProcess.pos);
        }
      });
    }

    closeConfirmation = () => {
      this.setState({
        alert:false,
        confirmation:false,
        pageDataProcess: {}
      });
    }

    closePreloader = () => {
      this.setState({
        alert:false,
        preloader:false,
      });
    }

    linkFormatter(links){
      let content = '', i;
      for(i in links){
        content = content + `<li><a href>${links[i].title}</a></li>`;
      }
      return `<ul>${content}</ul>`;
    }

    sectionContentFormatter(sections){
      let content = '', i;
      for (i in sections) {
        content = content + sections[i].rendered_content;
      }
      return content;
    }

    setRenderContent(content, container, pos = 0) {
      let structure = new DOMParser().parseFromString(content, 'text/html'),
          cont = document.createElement('div'),
          subCont = document.createElement('div');
      
      subCont.dataset.page = pos;
      subCont.innerHTML = structure.querySelector('body').innerHTML;
      cont.appendChild(subCont);
      container.innerHTML = cont.innerHTML;
    }

    render() {

      return (
        <div className='container'>

          <Navbar
            createPage={this.createPage.bind(this)}
            refreshLinks={this.refreshLinks.bind(this)}
            loadingPage={this.state.loadingPage}
            page='wiki'
            role={this.props.userId.role}
            userName={this.props.userId.userName}
          />

          <section className="pages-container" ref={this.pagesContainer}>
            <div>
              {this.state.pages.map((pageData, key) => {
                  return (
                    <div key={key} data-page={key}>
                      <div>
                        {(key !== 0 && 
                          this.props.userId.role !== 'Reader') &&
                          <button onClick={e =>{this.showPageData(key)}}>
                            <MdCreate />
                          </button>
                        }

                      </div>
                      <Page 
                        data={pageData} 
                        showPage = {this.showPage.bind(this)}
                        setRenderContent = {this.setRenderContent.bind(this)}
                        dataPage={key}
                      />
                    </div>
                  )
                })}
            </div>
            
            {this.state.loadingPage && <div className='blocker'></div>}
            
          </section>

          {this.state.showPageManager &&
            <div id='page-manager'>
              <div>
                <header>
                  <div>
                    <label>
                      { this.state.existingPage ? this.state.pageData.title : 'Create page' }
                    </label>
                  </div>
                  <div>
                    {
                      this.state.existingPage &&
                      <button onClick={this.closePageManager}>
                        <MdClose />
                      </button>
                    }
                  </div>
                </header>
                <section>
                  {!this.state.existingPage &&
                    <div>
                      <input
                        type='text'
                        value={this.state.pageData.title}
                        onChange={this.updatePageTitle}
                        placeholder='Page title'
                        className={this.state.existingPage ? 'readonly' : ''}
                      />
                    </div>
                  }
                  <div>

                    {!this.state.pageData.sections.length &&
                      <button onClick={e=>{this.showEditor('addns')}}>
                        <MdAdd />Add section
                      </button>
                    }

                    {this.state.pageData.sections.map((data, key) => {
                      return(
                        <PreviewSection
                          key = {key}
                          pos = {key}
                          content = {data.rendered_content}
                          showEditor = {this.showEditor.bind(this)}
                          removeSection = {this.removeSection.bind(this)}
                          showConfirmation={this.showConfirmation.bind(this)}
                          setRenderContent = {this.setRenderContent.bind(this)}
                        />
                      )
                    })}

                  </div>
                </section>
                {!this.state.existingPage &&
                  <footer>
                    <div>
                      <div>
                        <button onClick={this.closePageManager}>Cancel</button>
                        <button onClick={this.storePage}>Save</button>
                      </div>
                    </div>
                  </footer>
                }
              </div>
            </div>
          }

          {this.state.showEditor &&
            this.state.editorSettings.map((param, key) => {
              return(
                <Editor
                  key = {key}
                  pos = {param.pos}
                  mode = {param.mode}
                  getContentSection = {this.getContentSection.bind(this)}
                  updatePageSections = {this.updatePageSections.bind(this)}
                  closeEditor = {this.closeEditor.bind(this)}
                  showConfirmation={this.showConfirmation.bind(this)}
                />
              )
            })
          }

          <Alert 
            alert = {this.state.alert}
            
            confirmation = {this.state.confirmation}
            confirmationMsg = {this.state.confirmationMsg}

            preloader = {this.state.preloader}
            preloaderMsg = {this.state.preloaderMsg}
            
            process = {this.processPageData.bind(this)}
            cancel = {this.closeConfirmation.bind(this)}
          />
          
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
    userId: state.userId,
    callZome: state.callZome
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wiki)