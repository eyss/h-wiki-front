import React, { Fragment } from "react";

class Alert extends React.Component {
  //eslint-disable-next-line
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        {this.props.alert && (
          <div id="alert">
            {this.props.confirmation && (
              <div className="confirmation">
                <div>
                  <label>{this.props.confirmationMsg}</label>
                </div>
                <div>
                  <button onClick={this.props.cancel}>No</button>
                  <button onClick={this.props.process}>Yes</button>
                </div>
              </div>
            )}

            {this.props.preloader && (
              <div className="preloader">
                <div>
                  <label>{this.props.preloaderMsg}</label>
                </div>
                <div>
                  <div className="simple-preloader"></div>
                </div>
              </div>
            )}

            {!this.props.confirmation && !this.props.preloader && (
              <div className="alert">
                <div>
                  <label>{this.props.alertMsg}</label>
                </div>
                <div>
                  <button onClick={this.props.closeAlert}>Accept</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

export default Alert;
