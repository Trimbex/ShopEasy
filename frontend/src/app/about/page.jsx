'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const teamMembers = [
    {
      name: "Mohamed Fadel",
      role: "CEO & Founder",
      bio: "Mohamed has over 15 years of experience in retail and e-commerce, and founded ShopEasy to create a better shopping experience."
    },
    {
      name: "Saifeldin Mohamed",
      role: "CTO",
      bio: "Saifeldin leads our engineering team and is responsible for building our state-of-the-art e-commerce platform."
    },
    {
      name: "Ahmed Elsheikh",
      role: "Head of Product",
      bio: "Ahmed oversees our product catalog and ensures we offer the best selection of quality products to our customers."
    },
    {
      name: "Belal Anas",
      role: "Customer Experience Manager",
      bio: "Belal is dedicated to ensuring every customer has an exceptional experience shopping with us."
    },
    {
      name: "Ahmad Muhammad",
      role: "Marketing Director",
      bio: "Ahmad leads our marketing initiatives and is responsible for growing our customer base through innovative campaigns."
    },
    {
      name: "Mazen Ahmed",
      role: "Operations Manager",
      bio: "Mazen ensures the smooth operation of our logistics and supply chain to deliver products efficiently to our customers."
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        className="relative py-24 sm:py-32 bg-indigo-700 text-white overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-600 opacity-80"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl mb-6">
            About ShopEasy
          </h1>
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl">
            Our mission is to provide a seamless shopping experience with quality products at competitive prices.
          </p>
        </div>
      </motion.div>

      {/* Our Story Section */}
      <motion.div 
        className="py-16 sm:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg text-gray-500 max-w-none">
                <p>
                  Founded in 2015, ShopEasy began with a simple idea: make online shopping truly easy and enjoyable. We started as a small team of e-commerce enthusiasts who believed that online shopping should be as intuitive and pleasant as visiting your favorite local store.
                </p>
                <p className="mt-4">
                  Over the years, we've grown into a comprehensive marketplace offering thousands of products across numerous categories. We've built lasting relationships with trusted suppliers and manufacturers to ensure we only offer quality products.
                </p>
                <p className="mt-4">
                  Today, we serve customers around the world and continue to innovate to provide the best shopping experience possible. Our team has grown, but our core mission remains the same: to make shopping easy.
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Team working together"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.div 
        className="py-16 sm:py-24 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
              variants={itemFadeIn}
            >
              Our Values
            </motion.h2>
            <motion.p 
              className="mt-4 max-w-3xl mx-auto text-xl text-gray-500"
              variants={itemFadeIn}
            >
              These core principles guide everything we do.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg"
              variants={itemFadeIn}
            >
              <div className="h-12 w-12 rounded-md bg-indigo-600 flex items-center justify-center mb-5">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Quality First</h3>
              <p className="text-gray-500">
                We carefully curate every product to ensure it meets our high standards for quality and value.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg"
              variants={itemFadeIn}
            >
              <div className="h-12 w-12 rounded-md bg-indigo-600 flex items-center justify-center mb-5">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Customer-Centric</h3>
              <p className="text-gray-500">
                We put our customers at the center of everything we do, from site design to customer service.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg"
              variants={itemFadeIn}
            >
              <div className="h-12 w-12 rounded-md bg-indigo-600 flex items-center justify-center mb-5">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.35" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-500">
                We continuously improve our platform and offerings to provide cutting-edge shopping experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div 
        className="py-16 sm:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
              variants={itemFadeIn}
            >
              Meet Our Team
            </motion.h2>
            <motion.p 
              className="mt-4 max-w-3xl mx-auto text-xl text-gray-500"
              variants={itemFadeIn}
            >
              The dedicated people behind ShopEasy.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={itemFadeIn}
              >
                <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <span className="text-indigo-700 font-bold text-xl">
                    {member.name.split(' ').map(name => name[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 mb-2">{member.role}</p>
                <p className="text-gray-500">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        className="py-16 sm:py-24 bg-indigo-700 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
            Ready to start shopping?
          </h2>
          <p className="max-w-2xl mx-auto text-xl mb-8">
            Join thousands of satisfied customers who have discovered the ShopEasy difference.
          </p>
          <div>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50"
            >
              Browse Products
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 