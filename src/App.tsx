import React from 'react';
import Navbar from './components/navbar/Navbar';
import Experience from './sections/experience/Experience';
import Contact from './sections/contact/Contact';
import Home from './sections/home/Home';
import About from './sections/about/About';

function App() {
  return (
    <div>
      <Navbar></Navbar>
      <Home></Home>
      <About></About>
      <Experience></Experience>
      <Contact></Contact>
    </div>
  );
}

export default App;
