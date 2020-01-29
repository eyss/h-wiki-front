import React, { Fragment } from 'react';
import getEventListeners from 'geteventlisteners';

import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';

class Page extends React.Component {
    mdEditor = null;
    mdParser = null;
    constructor(props){
        super(props);
        this.article = React.createRef();

        this.mdParser = new MarkdownIt();
    }

    componentDidMount=()=>{ this.setFnLinks(); }
    
    componentDidUpdate=()=>{ this.setFnLinks(); }

    setFnLinks() {
        setTimeout(()=>{
            let links = this.article.current.querySelectorAll('a'),
        _this = this;
        for(var i in links) {
            if (links[i].tagName === 'A' && links[i].getEventListeners('click') === undefined) {
                links[i]
                .addEventListener('click', (e) =>{
                    e.preventDefault();
                    _this.props.showPage(e);
                });
            }
        }
        }, 100);
    }

    render() {
        let data = this.props.data;
        return(
            <article ref={this.article}
                className='page-container'>
                <header>
                    <div>
                        <div>
                        </div>
                        <h1>{data.title}</h1>
                    </div>
                </header>
                <MdEditor
                    ref={node => this.mdEditor = node}  
                    value={data.renderedContent}
                    renderHTML={(text) => this.mdParser.render(text)}
                />
            </article>
        )
    }
}

export default Page;