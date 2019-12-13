import React from 'react';
import '../styles/PreviewSection.scss';

export default class PreviewSection extends React.Component {
    constructor(props) {
      super(props);
      this.content = React.createRef();
    }
    
    componentDidMount() {
      this.content.current.innerHTML = this.props.content;
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
                  <div ref={this.content}></div>
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