import { Link } from "react-router-dom";
import { TodaysMission } from "../Missions.jsx";
import { ProgressStrip } from "../Progress.jsx";
import { LanguageSwitch } from "../language.jsx";
import HindiMascot from "./HindiMascot.jsx";

export default function HindiHome() {
  return (
    <div className="app hindi-home">
      <header className="navbar">
        <Link to="/hindi" className="brand">
          <img
            src="/logo/sahaj-icon.png"
            alt="सहज"
            className="brand-icon"
          />
          <span>सहज</span>
        </Link>

        <nav aria-label="मुख्य मेन्यू">
          <Link to="/hindi">होम</Link>
          <Link to="/hindi/learn">सीखें</Link>
          <Link to="/hindi/missions">मिशन</Link>
          <Link to="/hindi/safe-or-scam">सुरक्षा</Link>
          <Link to="/hindi/fun">मनोरंजन</Link>
          <LanguageSwitch className="" />
        </nav>
      </header>

      <main id="home">
        <section className="welcome">
          <div className="welcome-text">
            <p className="welcome-label">आपका अपना डिजिटल साथी</p>

            <h1>स्मार्टफोन चलाना अब बिल्कुल आसान!</h1>

            <p>
              फ़ोन या इंटरनेट चलाते समय कहीं भी कोई उलझन हो? बिल्कुल फ़िक्र न
              करें। हम सब कुछ आराम से, एक-एक कदम साथ मिलकर सीखेंगे।
            </p>

            <div className="hero-actions">
              <Link to="/hindi/learn" className="big-btn">
                चलिए, सीखना शुरू करें
              </Link>

              <Link to="/hindi/safe-or-scam" className="big-btn btn-ghost">
                सुरक्षित रहने के तरीक़े देखें
              </Link>
            </div>
          </div>

          <aside className="hero-note hindi-hero-note">
            <div className="hindi-hero-greeting">
              <HindiMascot
                variant="hero"
                alt="सहज आपका डिजिटल साथी"
              />
              <div>
                <p className="hindi-hero-hi">नमस्ते, मैं सहज हूँ।</p>
                <p className="hindi-hero-small">
                  आइए, आराम से साथ चलते हैं।
                </p>
              </div>
            </div>
            <h2>हम हर मोड़ पर आपके साथ हैं</h2>
            <ul>
              <li>हर बात आसान और बोलचाल की भाषा में</li>
              <li>अपनी गति से सीखें—कोई जल्दबाज़ी नहीं</li>
              <li>ऑनलाइन पैसों और फ़ोन को सुरक्षित रखने के तरीक़े</li>
            </ul>
          </aside>
        </section>

        <section className="activities">
          <h2>आज आप क्या देखना चाहेंगे?</h2>
          <p className="activities-sub">
            नीचे दिए किसी भी विषय को चुनिए—आराम से, अपने समय पर।
          </p>

          <div className="hindi-dashboard">
            <ProgressStrip />
            <TodaysMission />
          </div>

          <div className="activity-list">
            <article className="activity-card card-learn">
              <span className="card-num">1</span>
              <h3>फ़ोन चलाना सीखें</h3>
              <p>
                सेटिंग्स, फ़ोटो भेजना, Wi-Fi जोड़ना और ज़रूरी ऐप्स—सब आसान
                क़दमों में।
              </p>
              <Link className="link-more" to="/hindi/learn">
                सीखना शुरू करें →
              </Link>
            </article>

            <article className="activity-card card-safe">
              <span className="card-num">2</span>
              <h3>सुरक्षित रहें</h3>
              <p>
                फ़र्ज़ी कॉल, अनजान लिंक और ऑनलाइन ठगी को समय रहते पहचानें।
              </p>
              <Link className="link-more" to="/hindi/safe-or-scam">
                ठगी पहचानना सीखें →
              </Link>
              <div>
                <Link className="link-more" to="/hindi/emergency">
                  🚨 ठगी हो गई हो तो आपात मदद →
                </Link>
              </div>
            </article>

            <article className="activity-card card-fun">
              <span className="card-num">3</span>
              <h3>कुछ नया और मज़ेदार</h3>
              <p>
                छोटे-छोटे खेल और क्विज़—हँसते-खेलते नई बातें सीखें।
              </p>
              <Link className="link-more" to="/hindi/fun">
                शुरू करें →
              </Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer-note">
        सीखना आसान है, जब कोई साथ हो।
      </footer>
    </div>
  );
}