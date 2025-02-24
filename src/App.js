import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Services from './pages/Services';
import Furniture from './pages/Furniture';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PGHostels from './pages/PGHostels';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="App">
            <ScrollToTop />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/services" element={<Services />} />
              <Route path="/furniture" element={<Furniture />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pg-hostels" element={<PGHostels />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App; 