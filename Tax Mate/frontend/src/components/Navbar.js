import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { UserProfileModal } from "./ProfileModals";
import "./Navbar.css";

export const getLocalizedTaxMate = (langCode) => {
  const brandOverrides = {
    'hi': 'टैक्समेट',
    'as': 'টেক্সমেট',
    'bn': 'ট্যাক্সমেট',
    'gu': 'ટેક્સમેટ',
    'kn': 'ಟ್ಯಾಕ್ಸ್‌ಮೇಟ್',
    'ml': 'ടാക്സ്മേറ്റ്',
    'mr': 'टॅक्समेट',
    'mni-Mtei': 'ꯇꯦꯛꯁꯃꯦꯠ',
    'or': 'ଟ୍ୟାକ୍ସମେଟ୍',
    'pa': 'ਟੈਕਸਮੇਟ',
    'ta': 'டாக்ஸ்மேட்',
    'te': 'టాక్స్‌మేట్',
    'ur': 'ٹیکس میٹ'
  };
  return brandOverrides[langCode] || 'TaxMate';
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'password', 'delete'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showTranslate, setShowTranslate] = useState(false);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('taxmate_lang') || 'en');
  const navigate = useNavigate();

  const indianLanguages = [
    { code: 'en', name: 'English (Default)' },
    { code: 'as', name: 'Assamese (অসমীয়া)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'mni-Mtei', name: 'Meitei (Manipuri)' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ur', name: 'Urdu (اردو)' }
  ];

  const handleTranslate = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('taxmate_lang', langCode);
    window.dispatchEvent(new Event('languageChange'));

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      console.warn("Google Translate combo box not found. Using fallback.");
      // Fallback to cookie reload
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;

      if (langCode !== 'en') {
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      }
      setTimeout(() => window.location.reload(), 200);
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(localStorage.getItem('taxmate_lang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Decode token to check if guest (simple check)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.isGuest) {
          setIsGuest(true);
        } else {
          // Fetch full user details if registered
          const res = await api.get("/auth/me");
          setUser(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    };
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* LEFT – Logo */}
      <div className="navbar-left">
        <span className="logo notranslate">{getLocalizedTaxMate(currentLang)}</span>
      </div>

      {/* CENTER – Menu */}
      <ul className="navbar-center">
        <li><Link to="/dashboard">Overview</Link></li>
        <li><Link to="/calculator">Tax Calculator</Link></li>
        <li><Link to="/tax-history">My Tax Records</Link></li>
        <li><Link to="/ai-assistant">Doc Tax</Link></li>
      </ul>

      {/* RIGHT – Hamburger */}
      <div className="navbar-right">
        <div className="hamburger" onClick={() => setOpen(!open)}>
          <span className="notranslate">☰</span>
        </div>

        {open && (
          <div className="hamburger-menu">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </button>
            <div className="divider"></div>

            <div className="translate-toggle-wrapper">
              <div
                className="translate-toggle-btn"
                onClick={() => setShowTranslate(!showTranslate)}
                style={{ cursor: 'pointer', color: 'var(--foreground)' }}
              >
                <span>Translate </span>
              </div>

              <div className={`language-side-menu ${showTranslate ? 'show' : ''}`}>
                {indianLanguages.map(lang => (
                  <div
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--foreground)' }}
                    onMouseOver={(e) => e.target.style.background = 'var(--secondary)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                  >
                    <span className="notranslate">{lang.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider"></div>

            {isGuest ? (
              <>
                <button onClick={() => navigate("/")}>Login</button>
                <button onClick={() => navigate("/register")}>Sign Up</button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveModal("profile")}>My Profile</button>
                <div className="divider"></div>
                <button onClick={logout} className="logout-btn">Logout</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {activeModal === "profile" && (
        <UserProfileModal
          user={user}
          onClose={() => setActiveModal(null)}
          onLogout={logout}
        />
      )}
    </nav>
  );
};

export default Navbar;
