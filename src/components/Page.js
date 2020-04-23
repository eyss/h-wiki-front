import React from 'react';
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
        this.container = React.createRef();
    }

    componentDidMount=()=>{ 
        this.setFnLinks(); 
        this.props.setRenderContent(
            this.props.data.renderedContent,
            this.container.current,
            this.props.dataPage);
    }
    
    componentDidUpdate=()=>{ 
        this.setFnLinks(); 
        this.props.setRenderContent(
            this.props.data.renderedContent,
            this.container.current,
            this.props.dataPage);
    }

    setFnLinks = (e, _this = this) => {
        if (this.article.current.getEventListeners('click') === undefined) {
            this.article.current
                .addEventListener('click', function(e) {
                    if (e.target.nodeName === 'A' && !e.target.getAttribute('download')) {
                        e.preventDefault();
                        _this.props.showPage(e);
                    }
                });
        }
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
                <div ref={this.container} className='visual-content'></div>
            </article>
        )
    }
}

export default Page;