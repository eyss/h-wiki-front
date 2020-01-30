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
    }

    componentDidMount=()=>{ this.setFnLinks(); }
    
    componentDidUpdate=()=>{ this.setFnLinks(); }

    setFnLinks = (e, _this = this) => {
        if (this.article.current.getEventListeners('click') === undefined) {
            this.article.current
                .addEventListener('click', function(e) {
                    e.preventDefault();
                    if (e.target.nodeName === 'A') {
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