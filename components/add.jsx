//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const AppData = require('../appData');

const oPropTypes = {
  app: PropTypes.object,
  uploadedFile: PropTypes.string
};

class Add extends React.Component {

  /** called with properties:
   *  app: An instance of the overall app.  Note that props.app.ws
   *       will return an instance of the web services wrapper and
   *       props.app.setContentName(name) will set name of document
   *       in content tab to name and switch to content tab.
   */
  constructor(props) {
    super(props);

    this.state = {
      uploadedFileName: null,
      errorMessage: null
    };

    this.showFileName = this.showFileName.bind(this);
    this.handleSubmitButtonClicked = this.handleSubmitButtonClicked.bind(this);
    this.inputDropClicked = this.inputDropClicked.bind(this);
  }

  componentDidMount() {
    if (this.props.uploadedFile) {
      this.setState({
        uploadedFileName: this.props.uploadedFile
      })
    }
  }

  showFileName() {
    let sFileName = this.refs["dropZone"].files[0].name;
    if (sFileName.endsWith('.txt')) {
      sFileName = sFileName.replace(/\.[^/.]+$/, ""); //filename without extension.
    }

    AppData.uploadedFile = sFileName;
    this.handleSubmitButtonClicked(sFileName);
  };

  async handleSubmitButtonClicked(sFileName) {
    if (!sFileName) {
      this.setState({errorMessage: "Please select a file containing a document to upload!!!"});
    } else {
      try {
        let oFileData = this.refs["dropZone"].files[0];
        let sFileContent = await readFile(oFileData);
        let oResponseData = await this.props.app.ws.addContent(sFileName, sFileContent);
        this.props.app.setContentName(sFileName);
      } catch (e) {
        let sErrorMessage = e.message || "Something went wrong. Please try again later.";
        this.setState({
          errorMessage: sErrorMessage,
          uploadedFileName:sFileName
        });
      }
    }
  };

  inputDropClicked() {
    let oDropInputDom = this.refs["dropZone"];
    oDropInputDom.click();
  }

  render() {

    let oFileNameDom = !!this.state.uploadedFileName ?
      (<div id="showFileName">
        <span>File Name: <b>{this.state.uploadedFileName}</b></span>
      </div>) : null;

    let oErrorMessageDom = !!this.state.errorMessage ?
      (<span className="errorMessageFileUpload error">{this.state.errorMessage}</span>) : null;

    return (
      <div className="tabBodyContainer">
        <div className="fileDropZoneContainer">
          <form id="dropFileForm" className="dropzone" encType="multipart/form-data" onChange={this.showFileName}>
            <input id="file" className="inputDropzone" name="file" type="file" ref={"dropZone"} title={""}/>
            <span className="dropHere" onClick={this.inputDropClicked}>
              Drop File Here<br/>
              Or<br/>
              Click To Choose File
            </span>
            {/*<div id="submit" className="addFileButton" onClick={this.handleSubmitButtonClicked}>Add</div>*/}
            {oFileNameDom}
          </form>
        </div>
        {oErrorMessageDom}
      </div>
    );
  }

}

Add.propTypes = oPropTypes;

module.exports = Add;

/** Return contents of file (of type File) read from user's computer.
 *  The file argument is a file object corresponding to a <input
 *  type="file"/>
 */
async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });
}
