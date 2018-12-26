//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Search = require('./search.jsx');
const Content = require('./content.jsx');
const Add = require('./add.jsx');

const DocsWs = require('../lib/docs-ws');
/*************************** App Component ***************************/

const oPropTypes = {
  ws: PropTypes.instanceOf(DocsWs),
  appData: PropTypes.object
};

class App extends React.Component {

  constructor(props) {
    super(props);

    this.ws = props.ws;

    this.selectTab = this.selectTab.bind(this);
    this.setContentName = this.setContentName.bind(this);

    this.state = {
      selected: 'search',
      contentName: 'Content',
    };

  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  /** Set contentName and select content tab */
  setContentName(contentName) {
    this.setState({contentName, selected: 'content'});
  }

  selectTab(v) {
    this.setState({selected: v});
  }

  getTabHeaders() {
    let _this = this;
    let sSelectedTabId = this.state.selected;

    let aTabBlocks = ['search', 'add', 'content'].map(function (sEl) {
      let sSelected = sSelectedTabId === sEl ? "selected" : "";
      let sDisplayName = sEl.charAt(0).toUpperCase() + sEl.slice(1);
      let bIsTabDisabled = false;
      if (sEl === 'content') {
        sDisplayName = _this.state.contentName;
        bIsTabDisabled = _this.state.contentName === 'Content';
      }

      if (bIsTabDisabled) {
        sSelected += " disabled ";
      }

      let fTabSelectHandler = bIsTabDisabled ? null : _this.selectTab.bind(_this, sEl);
      return (
        <div className={"tabHeaderBlock " + sSelected} title={sDisplayName}
             onClick={fTabSelectHandler} key={sEl}>
          {sDisplayName}
        </div>
      );
    });
    return (
      <div className={"tabHeaders"}>
        {aTabBlocks}
      </div>);
  }

  getSelectedTabBody() {
    let sSelectedTabId = this.state.selected;
    let oAppData = this.props.appData;

    let oSelectedTabDOM = <Search app={this} searchKey={oAppData.searchKey} key="search"/>;
    if (sSelectedTabId === "add") {
      oSelectedTabDOM = <Add app={this} uploadedFile={oAppData.uploadedFile} key="add"/>;
    } else if (sSelectedTabId === "content") {
      oSelectedTabDOM = <Content app={this} key={this.state.contentName}/>;
    }

    return (
      <div className={"tabBody"}>
        {oSelectedTabDOM}
      </div>
    );
  }

  render() {

    return (
      <div className={"appContainerWrapper"}>
        <div className={"appContainer"}>
          <div className={"headerBarContainer"}>
            <div className={"appName"}>
              Docs Single-Page App
            </div>
          </div>
          <div className={"myBodyContainer"}>
            {this.getTabHeaders()}
            {this.getSelectedTabBody()}
          </div>

        </div>
      </div>
    );
  }

}

App.propTypes = oPropTypes;

module.exports = App;
