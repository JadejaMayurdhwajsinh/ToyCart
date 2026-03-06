import "./footer.css";
import rocketIcon from "../../assets/Rocket.svg";
import duckIcon from "../../assets/Duck.svg";
import dinosaurIcon from "../../assets/Dinosaur.svg";
import stackIcon from "../../assets/Stack Toy.svg";
import flamingoImage from "../../../public/images/Flamingo.png";
import instgramIcon from "../../assets/instagram.svg";
import tiktokIcon from "../../assets/tiktok.svg";
import { Link } from "react-router-dom";
import facebookIcon from "../../assets/facebook.svg";
import toycartlogo from "../../../public/images/toycart-logo.png";

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-top">
                <div className="footer-top-item">
                    <img src={rocketIcon} alt="Safety" />
                    <div>
                        <p>We ensure every toy’s safety – every time.</p>
                        <a href="#">Safety policy</a>
                    </div>
                </div>

                <div className="footer-top-item">
                    <img src={duckIcon} alt="Our impact" />
                    <div>
                        <p>We work towards protecting our planet</p>
                        <a href="#">Our impact</a>
                    </div>
                </div>

                <div className="footer-top-item">
                    <img src={dinosaurIcon} alt="How it started" />
                    <div>
                        <p>We extend the life-cycle of over 1000 pre-loved toys</p>
                        <a href="#">How it started</a>
                    </div>
                </div>

                <div className="footer-top-item">
                    <img src={stackIcon} alt="Blog & News" />
                    <div>
                        <p>We support creative, developmental play</p>
                        <a href="#">Blog & News</a>
                    </div>
                </div>
            </div>

            <div className="footer-main">
                <div className="footer-column footer-logo">
                    <h2><img src={toycartlogo} alt="toycart logo" className="toycart-logo" /></h2>
                </div>

                <div className="footer-column footer-grid-block">
                    <div className="footer-block">
                        <h4>Explore</h4>
                        <a href="#">Browse Toys</a>
                        <a href="#">Bundle recommendations</a>
                        <a href="#">Buy & Sell</a>
                        <a href="#">Short term rentals</a>
                        <a href="#">Gifting</a>
                    </div>

                    <div className="footer-block">
                        <h4>Learn</h4>
                        <a href="#">How it works</a>
                        <a href="#">Pricing</a>
                        <a href="#">Our impact</a>
                        <a href="#">Our story</a>
                        <a href="#">Resources</a>
                    </div>

                    <div className="footer-block">
                        <h4>Grow</h4>
                        <a href="#">Careers</a>
                        <a href="#">Help centre</a>
                        <a href="#">FAQs</a>
                    </div>

                    <div className="footer-block">
                        <h4>Connect</h4>
                        <a href="#">Contact us</a>
                        <a href="#">
                            <img src={instgramIcon} alt="Instagram" className="icon" />
                            Instagram
                        </a>
                        <a href="#">
                            <img src={tiktokIcon} alt="TikTok" className="icon" />
                            TikTok
                        </a>
                        <a href="#">
                            <img src={facebookIcon} alt="Facebook" className="icon" />
                            Facebook
                        </a>
                    </div>
                </div>

                <div className="footer-column footer-cta">
                    <div className="cta-block">
                        <h2>Ready to give it?</h2>
                        <button>Start your toy box</button>
                    </div>
                    <div className="footer-illustration">
                        <img src={flamingoImage} alt="Flamingo" />
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <Link to="/policy/legal-policies">Legal policies</Link>
                <Link to="/policy/privacy-policy">Privacy policy</Link>
                <Link to="/policy/modern-slavery-policy">Modern slavery policy</Link>
                <Link to="/policy/terms-and-conditions">Terms & Conditions</Link>
            </div>
        </footer>
    );
}

export default Footer;
