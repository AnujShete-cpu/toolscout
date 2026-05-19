import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Categories from './pages/Categories';
import HowItWorks from './pages/HowItWorks';
import ToolDetail from './pages/ToolDetail';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import WordCounter from './pages/WordCounter';
import ImageCompressor from './pages/ImageCompressor';
import CodeFormatter from './pages/CodeFormatter';
import ScrollToTop from './components/ScrollToTop';
import WordCounter from './pages/WordCounter';
import ImageCompressor from './pages/ImageCompressor';
import CodeFormatter from './pages/CodeFormatter';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/tool/:id" element={<ToolDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/word-counter" element={<WordCounter />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/code-formatter" element={<CodeFormatter />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
