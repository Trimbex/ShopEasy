'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="bg-gray-50 py-12 sm:py-16 lg:py-20"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Our Commitment to Privacy</h2>
          <p>
            At ShopEasy, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect several types of information, including:
          </p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, billing address, payment information, and other details you provide during account creation or checkout.</li>
            <li><strong>Transaction Information:</strong> Details about purchases and payment methods.</li>
            <li><strong>Technical Information:</strong> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system, and platform.</li>
            <li><strong>Usage Information:</strong> Information about how you use our website, products, and services.</li>
          </ul>
          
          <h2>How We Use Your Information</h2>
          <p>
            We use your information for the following purposes:
          </p>
          <ul>
            <li>To process and fulfill your orders</li>
            <li>To manage your account and provide customer support</li>
            <li>To send you important updates about your orders or account</li>
            <li>To improve our website, products, and services</li>
            <li>To personalize your shopping experience</li>
            <li>To send you marketing communications (if you've opted in)</li>
            <li>To comply with legal obligations</li>
          </ul>
          
          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track the activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
          
          <h2>Data Sharing and Disclosure</h2>
          <p>
            We may share your information with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Companies that perform services on our behalf, such as payment processing, delivery, and marketing.</li>
            <li><strong>Business Partners:</strong> Trusted third parties who help us operate our business.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
          
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
          
          <h2>Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul>
            <li>Right to access your personal information</li>
            <li>Right to correct inaccurate information</li>
            <li>Right to request deletion of your information</li>
            <li>Right to object to or restrict certain processing</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">contact us</Link>.
          </p>
          
          <h2>Children's Privacy</h2>
          <p>
            Our website is not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13.
          </p>
          
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p>
            We encourage you to review our Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">contact us</Link>:
          </p>
          <ul>
            <li>By email: privacy@shopeasy.com</li>
            <li>By phone: +1 (800) 123-4567</li>
            <li>By mail: ShopEasy Privacy Team, 123 Commerce Street, Tech City, CA 90210</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
} 