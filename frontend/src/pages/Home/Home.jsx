import "./Home.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Callout from "../../components/Callout/Callout.jsx";
import Textbox from "../../components/Textbox/Textbox.jsx";
import Productcard from "../../components/Productcard/Productcard.jsx";
import APIService from "../../services/api";
import boxClosed from "../../../public/images/box-closed.png";
import boxOpen from "../../../public/images/box-open.png";
import puppy from "../../../public/images/puppy.png";
import simpleFlamingo from "../../../public/images/simple-flamingo.png";
import beaver from "../../../public/images/beaver.png";
import moveup from "../../assets/moveup.svg";
import staticon from "../../assets/stat-icon.svg";
import arrowdown from "../../assets/arrow-down.svg";
import navprev from "../../assets/nav-prev.svg";
import navnext from "../../assets/nav-next.svg";
import dinosaur from "../../../public/images/dinosaur.png";
import dinosaur1 from "../../../public/images/dinosaur1.png";
import pilePhoto from "../../../public/images/photo-pile.png";
import workflowPhone from "../../../public/images/Video.png";
import ball from "../../../public/images/ball.png";
import toyimg from "../../../public/images/toy-img.png";
import beaver2 from "../../../public/images/beaver2.png";
import slideBaby from "../../../public/images/slideBaby-big.png";
import small1 from "../../../public/images/small-img1.png";
import small2 from "../../../public/images/small-img2.png";
import small3 from "../../../public/images/small-img3.png";
import gift1 from "../../../public/images/big-img2.png";
import commitment1 from "../../../public/images/big-img3.png";
import babyteddy from "../../../public/images/baby-teddy.png";
import toycartlogo from "../../../public/images/toycart-logo.png";
import marqueelogo1 from "../../../public/images/marquee-logo1.png";
import marqueelogo2 from "../../../public/images/marquee-logo2.png";
import marqueelogo3 from "../../../public/images/marquee-logo3.png";
import marqueelogo4 from "../../../public/images/marquee-logo4.png";

function Home() {
  const heroRef = useRef(null);
  const openBoxRef = useRef(null);
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollToOpenBox = () => {
    openBoxRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError("");
        const products = await APIService.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (err) {
        setError("Unable to load featured toys right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <>
      <div className="home-wrapper">
        <section className="home-hero" ref={heroRef}>
          <div className="hero-title-wrapper">
            <h1 className="hero-title">
              Share toys
              <br />
              <span className="highlight1">Grow</span> <span className="highlight2">minds</span>
            </h1>
          </div>

          <div className="hero-content-wrapper">
            <div className="hero-text">
              <p>
                A world of play without the waste.
                <br />
                Open up endless learning possibilities
                <br />
                by renting our pre-loved toys.
              </p>
            </div>

            <div className="hero-box-wrapper">
              <div className="box-with-dino">
                <img src={dinosaur} alt="Dinosaur" className="dinosaur-img" />
                <img src={boxClosed} alt="Closed box" className="closed-box" />
                <p className="scrollTo" onClick={scrollToOpenBox}>Scroll to open the box</p>
                <img src={arrowdown} alt="arrow-down img" className="arrow-down" />
              </div>
            </div>


            <div className="hero-buttons">
              <button className="btn-outline" onClick={() => navigate("/Alltoys")}>Browse toys</button>
              <button className="btn-primary" onClick={() => navigate("/Order")}>Start your toy box</button>
            </div>
          </div>
        </section>
        <section className="openbox-section" ref={openBoxRef}>
          <div className="openbox-section__top">
            <Callout
              text="We have over 1000 toys you can borrow from our collection."
              linkText="Browse toys"
              direction="left"
            />
          </div>
          <div className="openbox-section__center">
            <div className="floating-image__left">
              <img src={dinosaur1} alt="Dinosaur" className="dinosaur-img1" />
              <img src={puppy} alt="puppy" className="puppy-img" />
            </div>
            <div>
              <img src={boxOpen} alt="Open box" className="open-box" />
              <img src={ball} alt="ball" className="ball-img" />
            </div>
            <div>
              <Callout
                text="Our toy's life-cycles are x10 longer than the average toy."
                linkText="Read about our impact"
                direction="right"
              />
            </div>
            <div className="floating-image__right">
              <img src={beaver} alt="beaver" className="beaver-img" />
              <img src={simpleFlamingo} alt="simple flamingo" className="simpleFlamingo-img" />
            </div>
          </div>
          <div className="openbox-section__bottom">
            <Callout
              text="An incredible company that rents toys to families who want to play more and spend less."
              linkText="Read our story"
              direction="bottom"
            />
            <img src={moveup} alt="moveup icon" className="moveup-icon" onClick={scrollToHero} />
          </div>
        </section>
        <section className="pile-section">
          <img src={pilePhoto} alt="Pile of toys" className="pile-photo" />
        </section>
      </div>

      <section className="workflow">
        <h2 className="workflow-title">How it works</h2>

        <div className="workflow-content">
          <div className="workflow-phone">
            <img src={toycartlogo} alt="logo" className="toycartlogo" />
            <img
              src={workflowPhone}
              alt="Phone mockup"
              className="phone-image"
            />

            {/* <div className="workflow-actions">
              <button className="btn btn-active">Rent</button>
              <button className="btn">Buy</button>
              <button className="btn">Sell</button>
            </div> */}
          </div>

          <div className="workflow-steps">
            <ol>
              <li>
                <strong>Choose your plan</strong>
                <p>
                  Rhoncus augue imperdiet ullamcorper egestas. Elit quis libero
                  sed orci sed dolor sit.
                </p>
              </li>
              <li>
                <strong>Fill your box</strong>
                <p>
                  Augue imperdiet ullamcorper egestas. Elit quis libero sed orci
                  sed maecenas.
                </p>
              </li>
              <li>
                <strong>Keep the toys until you’re done</strong>
                <p>
                  Molestie malesuada sapien amet massa tellus lectus sed
                  maecenas.
                </p>
              </li>
              <li>
                <strong>Return and refresh</strong>
                <p>
                  Rhoncus augue imperdiet ullamcorper eget as. Molestie malesuada
                  sapien.
                </p>
              </li>
            </ol>

            <button className="btn-start">Get started</button>
          </div>
        </div>
      </section>

      <section className="time-for-toys">
        <div className="time-for-toys__top">
          <img src={beaver2} alt="beaver2 img" className="beaver2-img" />
          <h2 className="time-for-toys__title">It's time for the toys</h2>
        </div>
        <p className="time-for-toys__label">We categorise our toy collection by <a href="#" className="play-style">Play style</a> and <a href="#" className="age">Age</a></p>
        <div className="toys-grid">
          <div className="toy-card" onClick={() => navigate("/Alltoys")}>
            <img src={toyimg} alt="Toy 1" className="toy-image" />
            <p>Pritend play</p>
          </div>
          <div className="toy-card" onClick={() => navigate("/Alltoys")}>
            <img src={toyimg} alt="Toy 2" className="toy-image" />
            <p>Construction</p>
          </div>
          <div className="toy-card" onClick={() => navigate("/Alltoys")}>
            <img src={toyimg} alt="Toy 3" className="toy-image" />
            <p>STEM</p>
          </div>
          <div className="toy-card" onClick={() => navigate("/Alltoys")}>
            <img src={toyimg} alt="Toy 4" className="toy-image" />
            <p>Messy</p>
          </div>
          <div className="toy-card" onClick={() => navigate("/Alltoys")}>
            <img src={toyimg} alt="Toy 5" className="toy-image" />
            <p>Open ended</p>
          </div>
          <div className="toy-card" onClick={() => navigate("/Alltoys")}>
            <img src={toyimg} alt="Toy 6" className="toy-image" />
            <p>Open ended</p>
          </div>
        </div>
      </section>
      <section className="customerFav-section">
        <div className="customerFav-content">
          <div className="section-heading">
            <h4>Customer favourites</h4>
            <div className="heading-actions">
              <a href="/Alltoys" className="see-all-btn">See all toys</a>
              <button className="nav-btn nav-prev"><img src={navprev} alt="nav prev" /></button>
              <button className="nav-btn nav-next"><img src={navnext} alt="nav next" /></button>
            </div>
          </div>
          {loading && <p>Loading toys...</p>}
          {error && !loading && <p style={{ color: "#c00" }}>{error}</p>}
          {!loading && !error && featuredProducts.map((product) => (
            <Productcard
              key={product.id}
              id={product.id}
              ProductImage={product.image_url}
              ProductName={product.name}
              Price={product.price}
              rating={product.rating}
              reviewCount={product.number_of_reviews}
            />
          ))}
        </div>
      </section>
      <section className="safety-section">
        <div className="safety-content">
          <div className="safety-image">
            <img src={slideBaby} alt="Safety1" className="safety-img1" />
            <img src={small1} alt="Safety2" className="safety-img2" />
          </div>
          <div className="safety-text">
            <Textbox
              h2text="Sparkling & child-safe, every time."
              ptext="Massa faucibus cras dignissim convallis donec scelerisque eget placerat sit. Luctus morbi et mi vitae massa mattis velit. Amet dignissim quis diam massa lectus velit non. Faucibus sagittis posuere ultrices."
              linkText="Read our safety policy"
              linkHref="#"
            />
          </div>
        </div>
      </section>
      <section className="sollicit-section">
        <div className="sollicit-content">
          <div className="sollicit-image">
            <img src={babyteddy} alt="Baby teddy toy" className="sollicit-img1" />
          </div>

          <div className="sollicit-text">
            <div className="sollicit-text__top">
              <h2>Sollicit udin donec</h2>
            </div>
            <div className="sollicit-text__bottom">

              <p className="sollicit-text__content">
                Aliquet nunc enim egestas non gravida. Nec sed massa purus lacus.
                Tortor ornare pretium non sagittis eu aliquam.
              </p>

              <a href="#" className="sollicit-link">Visit marketplace</a>
            </div>
          </div>
        </div>
      </section>
      <section className="commitment-section">
        <div className="commitment-content">
          <div className="commitment-text">
            <Textbox
              h2text="Short term commitment"
              ptext="Massa faucibus cras dignissim convallis donec scelerisque eget placerat sit. Luctus morbi et mi vitae massa mattis velit. Amet dignissim quis diam massa lectus velit non. Faucibus sagittis posuere ultrices."
              linkText="Short term renting"
              linkHref="#"
            />
          </div>
          <div className="commitment-image">
            <img src={commitment1} alt="commitment img1" className="commitment-img1" />
            <img src={small3} alt="commitment img2" className="commitment-img2" />
          </div>
        </div>
      </section>
      <section className="sustainability-section">
        <div className="sustainability-content">
          <div className="sustainability-section__top">
            <div className="sustainability-section__top-h2">
              <h2>We have saved</h2>
            </div>
            <div>
              <p className="sustainability-section__top-img">
                <img src={staticon} alt="stat icon" className="stat-icon" />
                2,980,032</p>
            </div>
          </div>
          <div className="sustainability-section__center">
            <h2>toys from landfill so far</h2>
          </div>
          <div className="sustainability-section__bottom">
            <div>
              <p className="sustainability-section__bottom-p">Elit et libero turpis integer nam neque. Feugiat tellus non arcu vitae eget urna aliquam. Nisl sit eu massa sed mollis tellus commodo. Id at viverra.</p>
            </div>
            <div className="sustainability-section__bottom-btn">
              <a href="#">Our impact</a>
            </div>
          </div>
        </div>
      </section>
      <section className="gift-section">
        <div className="gift-content">
          <div className="gift-image">
            <img src={gift1} alt="Gift of endless play" className="gift-img1" />
            <img src={small2} alt="Gift of endless play" className="gift-img2" />
          </div>
          <div className="gift-text">
            <Textbox
              h2text="The gift of endless play"
              ptext="Massa faucibus cras dignissim convallis donec scelerisque eget placerat sit. Luctus morbi et mi vitae massa mattis velit. Amet dignissim quis diam massa lectus velit non. Faucibus sagittis posuere ultrices."
              linkText="Gifting with Whirli"
              linkHref="#"
            />
          </div>
        </div>
      </section>
      <section className="featured-section">
        <div className="featured-content">
          <div className="featured-content__text">
            <div>

              <h2 className="featured-content__h2">As featured in...</h2>
              <p className="featured-content__p">Pssst.. click on the cards to learn more!</p>
            </div>
            <div className="marquee">
              <div className="marquee-track">
                <div className="marquee-slider__box">
                  <img src={marqueelogo1} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo2} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo3} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo4} alt="logo" />
                </div>

                {/* Duplicate same items again */}
                <div className="marquee-slider__box">
                  <img src={marqueelogo1} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo2} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo3} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo4} alt="logo" />
                </div>

                <div className="marquee-slider__box">
                  <img src={marqueelogo1} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo2} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo3} alt="logo" />
                </div>
                <div className="marquee-slider__box">
                  <img src={marqueelogo4} alt="logo" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



    </>
  );
}

export default Home;
