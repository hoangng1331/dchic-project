import React from 'react';
import axios from 'axios';
import 'antd/dist/reset.css';
import './App.css';
import { Button } from 'antd';
import productname from './admin-page/sanpham';


function App() {
  return (
    <div className="App">
      <productname />
    </div>
  );
}

export default App;
