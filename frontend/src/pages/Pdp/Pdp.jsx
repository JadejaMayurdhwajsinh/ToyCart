import "./Pdp.css";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import slideBaby from "../../../public/images/slideBaby-big.png";
import small1 from "../../../public/images/small-img1.png";
import toy2img from "../../../public/images/toy2-img.png";
import toy2img1 from "../../../public/images/toy2-img1.png";
import toy2img2 from "../../../public/images/toy2-img2.png";
import toy2img3 from "../../../public/images/toy2-img3.png";
import toy2img4 from "../../../public/images/toy2-img4.png";
import Textbox from "../../components/Textbox/Textbox.jsx";
import earth from "../../../public/images/earth.png";
import arrow from "../../assets/arrow.svg";
import coin from "../../assets/coin.svg";
import union from "../../assets/Union.svg";
import stacktoy from "../../assets/Stacktoy.svg";
import earth1 from "../../assets/earth.svg";
import navprev from "../../assets/nav-prev.svg";
import navnext from "../../assets/nav-next.svg";
import review4star from "../../../public/images/review-4star.png";
import line from "../../../public/images/horizontal-line.png";
import threecar from "../../../public/images/3car.png";
import ProductDescription from "../../components/Productdescription/Productdescription.jsx";
import FeaturedItem from "../../components/FeaturedItem/FeaturedItem.jsx";
import FurtherDetails from "../../components/FurtherDetails/FurtherDetails.jsx";
import Actioncard from "../../components/Actioncard/Actioncard.jsx";
import instructionupicon from "../../assets/instruction-up-icon.svg";
import instructiondownicon from "../../assets/instruction-down-icon.svg";
import blackline from "../../assets/black-line.svg";
import Productcard from "../../components/Productcard/Productcard.jsx";
import APIService from "../../services/api";

function Pdp() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await APIService.getProductById(id);
                setProduct(data);

                // simple related products: same category, excluding current
                if (data?.Category?.id) {
                    const all = await APIService.getProducts({
                        category: data.Category.id,
                        limit: 8,
                    });
                    setRelatedProducts(all.filter((p) => p.id !== data.id));
                }
            } catch (err) {
                setError("Unable to load product details right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const productData = useMemo(() => {
        if (!product) {
            return {
                title: "",
                price: "",
                mainImage: toy2img,
                images: [toy2img4, toy2img3, toy2img2, toy2img1],
                ratingImage: review4star,
                description: "",
                coinIcon: coin,
                lineIcon: line,
                details: [],
            };
        }

        return {
            title: product.name,
            price: product.price,
            // FIXED
            mainImage: product.image_url || null,
            // FIXED — no fallback to local imports
            images: Array.isArray(product.additional_images)
                ? product.additional_images
                : [],
            ratingImage: review4star,
            description: product.description,
            coinIcon: coin,
            lineIcon: line,
            details: [
                {
                    icon: union,
                    title: "Category",
                    value: product.Category?.name || "Toys",
                },
                {
                    icon: stacktoy,
                    title: "Availability",
                    value: product.availability === "in_stock" ? "In stock" : "Out of stock",
                },
                {
                    icon: earth1,
                    title: "Rating",
                    value: product.rating ? `${product.rating} / 5` : "No ratings yet",
                },
            ],
        };
    }, [product]);

    const featuredItems = [
        {
            title: "Lorem ipsim",
            heading: "Three vehicles included",
            image: threecar,
            imageAlt: "3 car image",
            descriptions: [
                "Nam leo porta sit id aliquam in lobortis vitae consequat. Massa purus orci volutpat duis parturient. Ut nunc id bibendum.",
                "Massa egestas arcu blandit a. Suspendisse lectus id consequat sapien sit lorem."
            ]
        },
        {
            title: "Vehicles",
            heading: "Multiple Vehicle Options",
            image: threecar,
            imageAlt: "vehicles image",
            descriptions: [
                "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.",
                "Donec ullamcorper nulla non metus auctor fringilla. Vivamus suscipit tortor eget felis porttitor volutpat."
            ]
        },
        {
            title: "Automation",
            heading: "Smart Automation Features",
            image: threecar,
            imageAlt: "automation image",
            descriptions: [
                "Nullam quis risus eget urna mollis ornare vel eu leo. Vivamus suscipit tortor eget felis porttitor volutpat.",
                "Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla."
            ]
        },
        {
            title: "Easy to store",
            heading: "Compact Storage Design",
            image: threecar,
            imageAlt: "storage image",
            descriptions: [
                "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus suscipit tortor eget felis porttitor.",
                "Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod."
            ]
        },
        {
            title: "Dolor sit",
            heading: "Premium Quality Assurance",
            image: threecar,
            imageAlt: "quality image",
            descriptions: [
                "Aenean eu leo quam pellentesque ut, laoreet sit amet, justo. Donec ullamcorper nulla non metus auctor fringilla.",
                "Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus auctor fringilla."
            ]
        }
    ];

    const furtherDetailsItems = [
        {
            title: "Product information",
            content: "Elementum at fames nisi egestas viverra. Ullamcorper nulla neque bibendum arcu tortor leo non. Laoreet suscipit sed dolor sem maecenas tortor lorem nunc. A urna nec feugiat massa a velit magna tincidunt. Amet eu justo a et."
        },
        {
            title: "Instructions",
            content: "Amet quis massa laoreet donec pulvinar morbi at. Mattis varius ornare vestibulum id lacus vitae amet. Laoreet suscipit sed dolor sem maecenas tortor lorem nunc. A urna nec feugiat massa a velit magna tincidunt."
        },
        {
            title: "Learning through play skills",
            content: "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus suscipit tortor eget felis porttitor volutpat. Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod."
        }
    ];

    return (
        <>
            <section className="hero-section">
                <div className="hero-section__content">
                    <p className="hero-section__top-text">
                        Brows toys
                        <span><img src={arrow} alt="arrow icon" className="arrow-icon" /></span>
                        All toys
                        <span><img src={arrow} alt="arrow icon" className="arrow-icon" /></span>
                        {product ? product.name : "Loading..."}
                    </p>
                    {loading && <p>Loading product...</p>}
                    {error && !loading && <p style={{ color: "#c00" }}>{error}</p>}
                    {/* <div className="product-description">
                        <div className="product-description__images">
                            <img src={toy2img} alt="toy2 img" className="toy2-img" />
                            <div className="product-description__images-top">
                            </div>
                            <div className="product-description__images-bottom">
                                <img src={toy2img4} alt="toy2 sub img" className="toy2-img4" />
                                <img src={toy2img3} alt="toy2 sub img" className="toy2-img3" />
                                <img src={toy2img2} alt="toy2 sub img" className="toy2-img2" />
                                <img src={toy2img1} alt="toy2 sub img" className="toy2-img1" />
                            </div>
                        </div>
                        <div className="product-description__content">
                            <div>
                                <h2 className="product-description__content-title">VTech Toot-Toot Drivers Garage Playset</h2>
                                <p className="product-description__content-price"><span><img src={coin} alt="coin icon" className="coin icon" /></span>88</p>
                                <img src={review4star} alt="review 4 star" className="review-4star" />
                                <p className="product-description__content-text">Vel diam a lobortis rhoncus nunc adipiscing habitant vitae. Scelerisque condimentum in vulputate condimentum sollicitudin. Libero vel placerat dictumst a praesent neque et.</p>
                                <img src={line} alt="line" className="line" />
                                <a href="#" className="addToCart">Add to cart</a>
                                <img src={line} alt="line" className="" />
                            </div>
                            <div className="product-details">

                                <div className="product-details__item">
                                    <div className="product-details__icon">
                                        <img src={union} alt="union icon" />
                                    </div>
                                    <div className="product-details__text">
                                        <p className="product-details__title">Age recommendation</p>
                                        <p className="product-details__desc">1 year - 3 years</p>
                                    </div>
                                </div>

                                <img src={line} alt="line" className="" />
                                <div className="product-details__item">
                                    <div className="product-details__icon">
                                        <img src={stacktoy} alt="stack toy icon" />
                                    </div>
                                    <div className="product-details__text">
                                        <p className="product-details__title">Skills & Learning</p>
                                        <p className="product-details__desc">
                                            Helps with independent play and sensory learning
                                        </p>
                                    </div>

                                </div>
                                <img src={line} alt="line" className="" />

                                <div className="product-details__item">
                                    <div className="product-details__icon">
                                        <img src={earth1} alt="earth icon" />
                                    </div>
                                    <div className="product-details__text">
                                        <p className="product-details__title">Toy impact</p>
                                        <p className="product-details__desc">Lorem ipsum dolor sit</p>
                                    </div>
                                </div>
                                <img src={line} alt="line" className="" />

                            </div>

                        </div>
                    </div> */}
                    <ProductDescription product={productData} productId={product?.id} />
                </div>
                <FeaturedItem items={featuredItems} />
            </section>
            <FurtherDetails
                items={furtherDetailsItems}
                blackline={blackline}
                instructionupicon={instructionupicon}
                instructiondownicon={instructiondownicon}
            />
            <section className="pdp-sustainability-section">
                <div className="pdp-sustainability-content">
                    <div className="pdp-sustainability-section__top">
                        <div className="pdp-sustainability-section__top-h2">
                            <h2>This toys saves</h2>
                        </div>
                        <div>
                            <p className="pdp-sustainability-section__top-img">
                                <img src={earth} alt="earth img" className="earth-img" />
                                000,000</p>
                        </div>
                    </div>
                    <div className="pdp-sustainability-section__center">
                        <h2>carbon from the atmosphere</h2>
                    </div>
                    <div className="pdp-sustainability-section__bottom">
                        <p className="pdp-sustainability-section__bottom-p">Elit et libero turpis integer nam neque. Feugiat tellus non arcu vitae eget urna aliquam. Nisl sit eu massa sed mollis tellus commodo. Id at viverra.</p>
                    </div>
                </div>
            </section>

            <section className="pdp-safety-section">
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

            <section className="relatedProduct-section">
                <div className="relatedProduct-content">
                    <div className="section-heading">
                        <h4>Related products</h4>
                        <div className="heading-actions">
                            <a href="/Alltoys" className="see-all-btn">See all toys</a>
                            <button className="nav-btn nav-prev"><img src={navprev} alt="nav prev" /></button>
                            <button className="nav-btn nav-next"><img src={navnext} alt="nav next" /></button>
                        </div>
                    </div>
                    {!loading && !error && relatedProducts.map((rp) => (
                        <Productcard
                            key={rp.id}
                            id={rp.id}
                            ProductImage={rp.image_url}
                            ProductName={rp.name}
                            Price={rp.price}
                        />
                    ))}
                </div>
            </section>

            <section className="pdp-toy-actions">
                <Actioncard
                    title="Buy this toy new and pre-loved"
                    text="Nam leo porttitor sit aliquam in lobortis vitae consequat. Massa purus orci volutpat duis parturient. Ut nunc id bibendum."
                    button="Buy this toy"
                    variant="yellow"
                />

                <Actioncard
                    title="Sell a toy like this back to Whirli"
                    text="Placerat sollicitudin faucibus egestas viverra, cursus nascetur fermentum nam. Massa egestas arcu blandit a. Suspendisse lectus orci."
                    button="Sell this toy back"
                    variant="white"
                />

                <Actioncard
                    title="Gift this toy with a Whirli subscription"
                    text="Porta sit id aliquam in lobortis vitae consequat. Massa purus orci volutpat duis parturient. Ut nunc id bibendum."
                    button="Gift this toy"
                    variant="pink"
                />
            </section>
        </>
    );
}

export default Pdp;