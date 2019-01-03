//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const AppData = require('../appData');

const oPropTypes = {
  app: PropTypes.object,
  searchKey: PropTypes.string,
  updateSearchKey: PropTypes.func,
};

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchKey: this.props.searchKey,
      userInputValue: this.props.searchKey,
      searchList: [],
      errorMessage: "",
      links: []
    };

    this.handleSearchInputKeyPress = this.handleSearchInputKeyPress.bind(this);
    this.handleSearchKeyChanged = this.handleSearchKeyChanged.bind(this);
    this.searchButtonClicked = this.searchButtonClicked.bind(this);
    this.handleDocNameClicked = this.handleDocNameClicked.bind(this);
  }

  componentDidMount(){
    if(!!this.state.searchKey){
      this.searchButtonClicked(0);
    }
  }

  handleSearchInputKeyPress(e) {
    e.stopPropagation();
    if (e.charCode === 13) {
      this.searchButtonClicked(0);
    }
  }

  handleSearchKeyChanged(e) {
    let sSearchKey = e.target.value;
    this.setState({
      userInputValue: sSearchKey
    });
  }

  async searchButtonClicked(iStart = 0) {
    AppData.searchKey = this.state.userInputValue;

    try {
      let oSearchResults = await this.props.app.ws.searchDocs(this.state.userInputValue, iStart);

      let oToSet = {
        searchList: oSearchResults.results,
        links: oSearchResults.links,
        searchKey: this.state.userInputValue
      };
      if(!oSearchResults.results.length){
        oToSet.errorMessage = `No results found for '${this.state.userInputValue}'.`
      }
      this.setState(oToSet);
    } catch (e) {
      let sErrorMessage = e.message || "Something went wrong. Please try again later.";
      this.setState({
        errorMessage: sErrorMessage,
        searchList: [],
        links: [],
        searchKey: this.state.userInputValue
      });
    }
  }

  handleDocNameClicked(sDocName) {
    this.props.app.setContentName(sDocName);
  }

  getSearchWidget() {
    return (
      <div id="searchBarContainerFormId" className="searchBarContainerForm">
        <div className="dummyWrapper">
          <input id="query"
                 className="searchInput"
                 name="q"
                 placeholder="Please fill in one or more search terms."
                 ref={"searchInputDOM"}
                 value={this.state.userInputValue}
                 onChange={this.handleSearchKeyChanged}
                 onBlur={this.searchButtonClicked.bind(this, 0)}
                 onKeyPress={this.handleSearchInputKeyPress}/>
        </div>
      </div>
    );
  }

  getSearchListContainerView() {

    let oErrorMessage = !!this.state.errorMessage ?
      <div className="errorMessage error">{this.state.errorMessage}</div> : null;

    let aSearchResult = this.state.searchList;
    let oNothingToShow = !aSearchResult.length && !oErrorMessage ?
      <div className="nothingToShow">Nothing To Display</div> : null;

    let iNextStart = null, iPrevStart = null;
    this.state.links.forEach(function (oLink) {
      let iLinkStart = Number(oLink.start);
      if (oLink.rel.toLowerCase() === 'next') {
        iNextStart = iLinkStart;
      }

      if (oLink.rel.toLowerCase() === 'previous') {
        iPrevStart = iLinkStart;
      }
    });

    return (
      <div className="searchListPaginationWrapper">
        <div className="searchListContainer">
          {oNothingToShow}
          {oErrorMessage}
          {this.getSearchListView()}
        </div>
        <div className="nextPrevContainer">
          {iNextStart == null ? null :
            <div id="next" className="nextButton" onClick={this.searchButtonClicked.bind(this, iNextStart)}>Next
              ⇛</div>}
          {iPrevStart == null ? null :
            <div id="previous" className="prevButton" onClick={this.searchButtonClicked.bind(this, iPrevStart)}>⇚
              Prev</div>}
        </div>
      </div>
    );
  }

  getSearchListView() {
    let _this = this;
    let aSearchResult = this.state.searchList;
    if (!aSearchResult.length) {
      return null;
    }

    let aSearchTerms = this.state.searchKey.split(/\s+/);
    let aListNodes = [];
    aSearchResult.forEach(function (oData, index) {
      let aModifiedLines = _this._getSearchTermHighlightedLines(oData.lines, aSearchTerms);
      let aLinesDOM = aModifiedLines.map(function (line, i) {
        return <span className="doc-line" dangerouslySetInnerHTML={{__html: line}} key={i+1000}></span>;
      });

      let oListNode = (
        <div className="listNode result" key={index}>
          <div className="listHeader doc-name result-name"
               onClick={_this.handleDocNameClicked.bind(_this, oData.name)}>{oData.name}</div>
          {aLinesDOM}
        </div>);

      aListNodes.push(oListNode)
    });
    return aListNodes;
  }

  _getSearchTermHighlightedLines(aLines, aTerm) {
    let aTemp = aLines;
    let iSearchTermIndex = 0;
    while (iSearchTermIndex < aTerm.length) {
      aTemp = this._getSearchTermHighlightedLines2(aTemp, aTerm[iSearchTermIndex]);
      iSearchTermIndex++;
    }

    return aTemp;
  }

  _getSearchTermHighlightedLines2(aLines, sTerm) {
    let aUpdated = [];
    aLines.forEach(function (sLine) {
      let simpleText = new RegExp(`(${sTerm})`, "gi");
      let sHighlighted = `<span class='search-term'>$1</span>`;
      let sNewLine = sLine.replace(simpleText, sHighlighted);
      aUpdated.push(sNewLine);
    });

    return aUpdated;
  }

  render() {
    return (
      <div className="tabBodyContainer">
        {this.getSearchWidget()}
        {this.getSearchListContainerView()}
      </div>
    );
  }

}

Search.propTypes = oPropTypes;

module.exports = Search;
