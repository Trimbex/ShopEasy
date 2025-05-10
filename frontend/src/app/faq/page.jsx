'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and going to the Order History section in your profile. There you'll find all your orders and their current status."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All payments are securely processed."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Please visit our Returns page for more details and to initiate a return."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping times vary depending on the destination. Additional customs fees and taxes may apply and are the responsibility of the customer."
    },
    {
      question: "How long will it take to receive my order?",
      answer: "Domestic orders typically arrive within 3-5 business days. International orders usually take 7-14 business days, depending on the destination country and customs processing."
    },
    {
      question: "Can I change or cancel my order?",
      answer: "You can modify or cancel your order within 1 hour of placing it. After that, the order goes into processing and cannot be changed. Please contact customer service immediately if you need to make changes."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, we offer gift wrapping services for a small additional fee. You can select this option during checkout and even include a personalized message."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team via email at support@shopeasy.com, by phone at +1 (800) 123-4567 during business hours (9am-5pm EST, Monday-Friday), or through the Contact page on our website."
    }
  ];

  // Fade in animation for the page
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } }
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
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Find answers to commonly asked questions about our products and services.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white shadow overflow-hidden rounded-lg"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 text-left focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <span className="ml-6 flex-shrink-0">
                    <svg 
                      className={`h-5 w-5 transition-transform duration-200 ${openQuestion === index ? 'transform rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </button>
              {openQuestion === index && (
                <motion.div 
                  className="px-6 py-4 border-t border-gray-200"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-base text-gray-700">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-base text-gray-600">
            Still have questions?
          </p>
          <div className="mt-3">
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 