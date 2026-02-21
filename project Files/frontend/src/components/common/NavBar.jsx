import React, { useContext, useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { UserContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ setSelectedComponent }) => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [brightnessOn, setBrightnessOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef();

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      document.body.classList.toggle('dark-mode', newMode);
      localStorage.setItem('darkMode', newMode);
      setSettingsOpen(false);
      return newMode;
    });
  };

  const toggleBrightness = () => {
    setBrightnessOn(prev => {
      const newBrightness = !prev;
      document.body.style.filter = newBrightness ? 'brightness(1.2)' : '';
      setSettingsOpen(false);
      return newBrightness;
    });
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleOptionClick = (component) => {
    setSelectedComponent(component);
  };

  return (
    <Navbar
      expand="lg"
      style={{
        backdropFilter: 'blur(12px) saturate(1.2)',
        background: 'rgba(30,41,59,0.82)',
        borderRadius: '0 0 18px 18px',
        boxShadow: '0 4px 24px #00e0ff22',
      }}
    >
      <Container fluid>
        <Navbar.Brand>
          <span style={{ color: '#0a2342', fontWeight: 'bold', fontSize: '1.3rem' }}>
            <span style={{ color: '#00e0ff' }}>L</span>earnhub
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto my-2 my-lg-0" style={{ alignItems: 'center' }}>
            <a href="/dashboard" style={{ marginRight: 8, padding: '6px 12px', background: '#232526', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>
              Home
            </a>

            {/* Settings */}
            <div ref={settingsRef} style={{ position: 'relative', display: 'inline-block', marginRight: 8 }}>
              <button
                onClick={() => setSettingsOpen(prev => !prev)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#232526',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚙️ Settings
              </button>

              {settingsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  background: '#232526',
                  color: '#fff',
                  borderRadius: 8,
                  minWidth: 160,
                  padding: 4,
                  boxShadow: '0 2px 12px #00e0ff33',
                  animation: 'fadeInDropdown 0.25s ease-in-out'
                }}>
                  <button
                    onClick={toggleDarkMode}
                    style={{ width: '100%', padding: 6, background: 'none', border: 'none', color: '#fff', textAlign: 'left', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
                  </button>

                  <button
                    onClick={toggleBrightness}
                    style={{ width: '100%', padding: 6, background: 'none', border: 'none', color: '#fff', textAlign: 'left', fontWeight: 700, cursor: 'pointer' }}
                  >
                    💡 Toggle Brightness
                  </button>
                </div>
              )}
            </div>

            {/* Conditional Buttons */}
            {user?.userData?.type === 'Teacher' && <button className="premium-btn" onClick={() => handleOptionClick('addcourse')}>Add Course</button>}
            {user?.userData?.type === 'Admin' && <button className="premium-btn" onClick={() => handleOptionClick('courses')}>Courses</button>}
            {user?.userData?.type === 'Student' && <button className="premium-btn" onClick={() => handleOptionClick('enrolledcourses')}>Enrolled Courses</button>}
          </Nav>

          {/* User + Logout */}
          <Nav style={{ alignItems: 'center' }}>
            <span style={{ color: '#00e0ff', fontWeight: 700, marginRight: 8 }}>Hi {user?.userData?.name}</span>
            <Button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(90deg,#ff5858 0%,#f09819 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 6,
              }}
            >
              Log Out
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
