import React, { Fragment } from 'react';
import MarkdownRenderer from 'react-markdown-renderer'

class Page extends React.Component {

    constructor(props){
        super(props);
        this.article = React.createRef()
    }

    componentDidMount=()=>{ this.setFnLinks(); }
    
    componentDidUpdate=()=>{ this.setFnLinks(); }

    setFnLinks() {
        
        let links = this.article.current.querySelectorAll('a'),
            _this = this;

        for(var i in links) {
            if (links[i].tagName === 'A') {
                links[i]
                .addEventListener('click', function(e) {
                    e.preventDefault();
                    _this.props.handleToUpdate(e);
                });
            }
        }
    }

    render() {
        let data = this.props.data;
        return(
            <article ref={this.article}>
                <header>
                    <div>
                        <div>
                        </div>
                        <h1>{data.title}</h1>
                    </div>
                </header>
                {data.sections.map((section, key) => {
                    return(
                        <Fragment key={key}>
                            <MarkdownRenderer 
                                data-nsection={key}
                                markdown={section.content}
                            />
                        </Fragment>
                    )
                })}
            </article>
        )
    }
}

export default Page;