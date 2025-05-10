'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Welcome to ShopEasy</h2>
          <p>
            These terms of service outline the rules and regulations for the use of ShopEasy's website and services.
          </p>
          <p>
            By accessing this website, we assume you accept these terms and conditions. Do not continue to use ShopEasy if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          
          <h2>Definitions</h2>
          <p>
            For the purposes of these Terms of Service:
          </p>
          <ul>
            <li><strong>"Company"</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to ShopEasy, Inc.</li>
            <li><strong>"Service"</strong> refers to the website and all services provided by ShopEasy.</li>
            <li><strong>"User"</strong> or <strong>"You"</strong> refers to the individual accessing or using the Service.</li>
            <li><strong>"Products"</strong> refers to the items offered for sale on the Service.</li>
          </ul>
          
          <h2>User Accounts</h2>
          <p>
            When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
          </p>
          
          <h2>Products and Purchases</h2>
          <p>
            We reserve the right to refuse service to anyone for any reason at any time.
          </p>
          <p>
            All product descriptions and pricing are subject to change without notice. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
          </p>
          <p>
            We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
          </p>
          
          <h2>Limitation of Liability</h2>
          <p>
            In no event shall ShopEasy, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ol>
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ol>
          
          <h2>Returns and Refunds</h2>
          <p>
            Our return and refund policy is designed to ensure your satisfaction with our products. For detailed information, please visit our <Link href="/returns" className="text-indigo-600 hover:text-indigo-800">Returns and Refunds page</Link>.
          </p>
          
          <h2>Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</Link> to understand our practices.
          </p>
          
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">contact us</Link>.
          </p>
        </div>
      </div>
    </motion.div>
  );
} 