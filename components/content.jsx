//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const oPropTypes = {
  app: PropTypes.object
};

class Content extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      content: "",
      errorMessage: ""
    }
  }

  componentDidMount() {
    this.contentStateHandler();
  }

  static async getContentData(WS, sContentName) {
    try {
      let oContentData = await WS.getContent(sContentName);
      return {content: oContentData.content};
    } catch (e) {
      let sErrorMessage = e.message || "Something went wrong. Please try again later.";
      return {errorMessage: sErrorMessage};
    }
  }

  async contentStateHandler (){
    let App = this.props.app;
    let WS = App.ws;
    let sContentName = App.state.contentName;
    let oContentData = await Content.getContentData(WS, sContentName);
    if (oContentData.errorMessage) {
      this.setState({errorMessage: oContentData.errorMessage});
    } else {
      this.setState({content: oContentData.content});
    }
  }

  render() {

    let sContent = !!this.state.content ? this.state.content : null;
    let oErrorMessage = !!this.state.errorMessage ?
      <div className="docContentErrorMessage error">{this.state.errorMessage}</div> : null;

    return (
      <div className="tabBodyContainer">
        <div className="docContentContainer content">
          {sContent}
          {oErrorMessage}
        </div>
      </div>
    );
  }

}

Content.propTypes = oPropTypes;

module.exports = Content;
