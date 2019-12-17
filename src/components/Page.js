import React from 'react';
import MarkdownRenderer from 'react-markdown-renderer'

class Page extends React.Component {

    constructor(props){
        super(props);
        this.article = React.createRef()
    }

    componentDidMount=()=>{
        this.setFnLinks();
    }
    componentDidUpdate=()=>{
        this.setFnLinks();
    }
    setFnLinks() {
        
        let links = this.article.current.querySelectorAll('a'), // `.current` is the parameter that contain the article element
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
        // const markdown = `My favorite search engine is [Duck Duck Go](https://duckduckgo.com) Lorem, ipsum dolor [google](https://google.com) amet consectetur adipisicing elit. Eius molestias quod quisquam,  illum similique [wikipedia](https://wikipedia.com) saepe perspiciatis porro sed quo nostrum temporibus voluptas  rerum recusandae, soluta [asperiores](https://en.wiktionary.org/wiki/asperiores).`;
        let data = this.props.data,
            title = data.title,
            address = data.address,
            sections = data.sections;
            
        return(
            
            <article ref={this.article}>
                <MarkdownRenderer markdown={title} />

                {sections.map((section, key) => {
                    return(
                        <article key={key} data-nsection={key}>
                            

                            <MarkdownRenderer markdown={section.content} />
                        </article>
                    )
                })}
            </article>
        )
    }
}

export default Page;