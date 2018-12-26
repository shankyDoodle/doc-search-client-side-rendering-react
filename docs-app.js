const React = require('react');
const ReactDom = require('react-dom');

const DocsWs = require('./lib/docs-ws');

const App = require('./components/app.jsx');
const AppData = require('./appData');

function main() {
  const ws = new DocsWs();
  const app = <App ws={ws} appData={AppData}/>;
  ReactDom.render(app, document.getElementById('app'));
}

main();
