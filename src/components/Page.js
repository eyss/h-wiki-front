import React from 'react';
import MarkdownRenderer from 'react-markdown-renderer'

class Page extends React.Component {

    constructor(props){
        super(props);
        this.article = React.createRef()
    }

    componentDidMount(){
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
        let x = this.props.data;
        let content = x.data.getPage.content;
        let title = x.data.getPage.title;

        return(
            
            <article ref={this.article}>
                <MarkdownRenderer markdown={title} />
                <MarkdownRenderer markdown={content} />
            </article>
        )
    }
}

export default Page;