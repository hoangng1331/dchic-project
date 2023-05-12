import React from 'react';
import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import "numeral/locales/vi";
import numeral from 'numeral';

numeral.locale("vi");
function App() {
  return (
    <Menu/>
  );
}

export default App;
