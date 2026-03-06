import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PolicyPages.css";

const policies = {
  "legal-policies": {
    title: "Legal Policies",
    emoji: "⚖️",
    sections: [
      {
        heading: "1. Company Information",
        content: `ToyCart is a toy rental and subscription service operated by ToyCart Pvt. Ltd., registered in India. Our registered office is located at 123 Play Street, Surat, Gujarat – 395001. For any legal queries, please contact us at legal@toycart.com.`
      },
      {
        heading: "2. Intellectual Property",
        content: `All content on this website including text, images, logos, graphics, and software is the exclusive property of ToyCart Pvt. Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`
      },
      {
        heading: "3. Limitation of Liability",
        content: `ToyCart shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products. Our total liability to you for any claim arising from use of the platform shall not exceed the amount paid by you in the three months preceding the claim.`
      },
      {
        heading: "4. Governing Law",
        content: `These legal policies are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these policies shall be subject to the exclusive jurisdiction of the courts located in Surat, Gujarat.`
      },
      {
        heading: "5. Toy Safety & Compliance",
        content: `All toys available on ToyCart meet applicable safety standards and regulations. We conduct regular inspections of our toy inventory to ensure they are clean, safe, and age-appropriate. ToyCart is not liable for misuse of toys outside their intended age range or purpose.`
      },
      {
        heading: "6. Changes to Legal Policies",
        content: `ToyCart reserves the right to update these legal policies at any time. We will notify registered users of any significant changes via email. Continued use of our platform after changes constitutes your acceptance of the revised policies.`
      },
    ]
  },
  "privacy-policy": {
    title: "Privacy Policy",
    emoji: "🔒",
    sections: [
      {
        heading: "1. Information We Collect",
        content: `We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, delivery address, and payment information. We also automatically collect certain usage data when you interact with our platform.`
      },
      {
        heading: "2. How We Use Your Information",
        content: `We use the information we collect to process your toy rentals and purchases, deliver products to your address, send you order confirmations and updates, provide customer support, improve our platform and services, and send you promotional communications (with your consent).`
      },
      {
        heading: "3. Information Sharing",
        content: `ToyCart does not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist in operating our platform (such as delivery partners and payment processors), subject to strict confidentiality agreements.`
      },
      {
        heading: "4. Data Security",
        content: `We implement industry-standard security measures to protect your personal information. All payment data is encrypted using SSL technology. Your account password is stored using secure hashing algorithms. However, no method of transmission over the internet is 100% secure.`
      },
      {
        heading: "5. Cookies",
        content: `Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can choose to disable cookies through your browser settings, though this may affect the functionality of our website.`
      },
      {
        heading: "6. Children's Privacy",
        content: `ToyCart is a family-friendly platform. We do not knowingly collect personal information from children under 13 years of age. If you believe a child has provided us with personal information, please contact us immediately and we will delete it promptly.`
      },
      {
        heading: "7. Your Rights",
        content: `You have the right to access, correct, or delete your personal information at any time. You may update your profile details through your account settings or contact us at privacy@toycart.com. You may also opt out of marketing communications at any time.`
      },
    ]
  },
  "modern-slavery-policy": {
    title: "Modern Slavery Policy",
    emoji: "🤝",
    sections: [
      {
        heading: "1. Our Commitment",
        content: `ToyCart Pvt. Ltd. is committed to acting ethically and with integrity in all our business relationships. We are committed to implementing and enforcing effective systems and controls to ensure modern slavery and human trafficking are not taking place anywhere in our business or supply chains.`
      },
      {
        heading: "2. Our Business",
        content: `ToyCart operates a sustainable toy rental and subscription service across India. We source our toy inventory from certified manufacturers and distributors who share our commitment to ethical business practices and fair labour standards.`
      },
      {
        heading: "3. Our Supply Chains",
        content: `Our supply chains include toy manufacturers, logistics and delivery partners, packaging suppliers, and technology service providers. We conduct due diligence on all major suppliers to assess the risk of modern slavery and human trafficking in their operations.`
      },
      {
        heading: "4. Our Policies",
        content: `We operate a number of internal policies to ensure we conduct business ethically and that the people working for us are protected. These include our Supplier Code of Conduct, Whistleblowing Policy, Recruitment Policy, and Equal Opportunities Policy.`
      },
      {
        heading: "5. Due Diligence",
        content: `We conduct regular audits of our supplier relationships and require all new suppliers to confirm their compliance with our Supplier Code of Conduct. We reserve the right to terminate relationships with any supplier found to be in violation of our ethical standards.`
      },
      {
        heading: "6. Reporting Concerns",
        content: `If you have concerns about modern slavery or human trafficking in connection with ToyCart's operations or supply chains, please report them to ethics@toycart.com. All reports will be treated with the utmost confidentiality and investigated thoroughly.`
      },
    ]
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    emoji: "📋",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: `By accessing or using the ToyCart platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and customers of ToyCart.`
      },
      {
        heading: "2. Rental Agreement",
        content: `When you rent a toy through ToyCart, you agree to use the toy responsibly and return it in the same condition it was received (subject to normal wear and tear). Toys must not be permanently modified, broken intentionally, or used outside their intended purpose.`
      },
      {
        heading: "3. Subscription Plans",
        content: `ToyCart offers various subscription plans that allow you to rent a set number of toys per month. Subscription fees are billed in advance on a monthly or annual basis. You may cancel your subscription at any time, with cancellation taking effect at the end of the current billing period.`
      },
      {
        heading: "4. Toy Condition & Damage",
        content: `All toys are thoroughly cleaned and inspected before dispatch. If a toy is returned with damage beyond normal wear and tear, ToyCart reserves the right to charge a damage fee. We will notify you of any such charges before processing them.`
      },
      {
        heading: "5. Returns & Exchanges",
        content: `You may return toys at any time during your subscription period. Returns are free of charge for active subscribers. Toys must be returned in their original packaging where possible. ToyCart will arrange collection from your registered address within 3-5 business days of a return request.`
      },
      {
        heading: "6. Payment Terms",
        content: `All prices are listed in Indian Rupees (₹) and include applicable taxes. Payment is processed securely at the time of order. ToyCart accepts major credit/debit cards and UPI payments. Subscription fees are automatically charged on your renewal date.`
      },
      {
        heading: "7. Account Responsibility",
        content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Please notify us immediately of any unauthorised use of your account at support@toycart.com.`
      },
      {
        heading: "8. Termination",
        content: `ToyCart reserves the right to suspend or terminate your account if you violate these terms and conditions, fail to return toys, or engage in fraudulent activity. Upon termination, all outstanding rentals must be returned immediately.`
      },
    ]
  }
};

export default function PolicyPages() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const policy = policies[slug];

  useEffect(() => { window.scrollTo({ top: 0 }); }, [slug]);

  if (!policy) return (
    <div className="policy-not-found">
      <h2>Page not found</h2>
      <button onClick={() => navigate("/")}>Go Home</button>
    </div>
  );

  return (
    <div className="policy-page">
      {/* Hero */}
      <div className="policy-hero">
        <span className="policy-emoji">{policy.emoji}</span>
        <h1 className="policy-title">{policy.title}</h1>
        <p className="policy-last-updated">Last updated: January 2025</p>
      </div>

      {/* Content */}
      <div className="policy-container">
        <div className="policy-content">
          {policy.sections.map((section, i) => (
            <div key={i} className="policy-section">
              <h2 className="policy-section-heading">{section.heading}</h2>
              <p className="policy-section-text">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="policy-sidebar">
          <div className="policy-sidebar-card">
            <h3>Other Policies</h3>
            {Object.entries(policies).map(([key, val]) => (
              <button
                key={key}
                className={`policy-nav-link ${key === slug ? "policy-nav-link--active" : ""}`}
                onClick={() => navigate(`/policy/${key}`)}
              >
                {val.emoji} {val.title}
              </button>
            ))}
          </div>
          <div className="policy-contact-card">
            <h3>Questions?</h3>
            <p>If you have any questions about our policies, we're here to help.</p>
            <a href="mailto:support@toycart.com" className="policy-contact-btn">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
