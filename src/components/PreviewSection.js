import React from 'react';
import '../styles/PreviewSection.scss';
import MarkdownRenderer from 'react-markdown-renderer'

export default class PreviewSection extends React.Component {
    constructor(props) {
      super(props);
    }

    openEditor = (e) => {
      this.props.openEditor(this.props.pos, e.target.dataset.mode)
    }

    removeSection = () => {
      this.props.removeSection(this.props.pos)
    }

    render() {
        return(
            <div className='preview-section'>
                <div>
                  <MarkdownRenderer markdown={this.props.content} />
                  <div>
                    <div>
                      <button data-mode='edit' onClick={this.openEditor}>Edit</button>
                      <button data-mode='addSB' onClick={this.openEditor}>Add section below</button>
                    </div>
                  </div>

                </div>

                <div>
                  <div>
                    <button onClick={this.removeSection}>X</button>
                  </div>
                </div>
                
            </div>
        )
    }
}