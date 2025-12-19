import { motion } from 'framer-motion';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <DocumentTextIcon className="w-16 h-16 text-violet-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated on <span className="font-semibold">December 16, 2025</span>
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              Welcome to <span className="font-semibold">BrokerIn</span>. These Terms and Conditions ("Terms") govern your access to and use of our website, services, and platform. By accessing or using our services, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Please read these Terms carefully before using our services. If you do not agree with any part of these Terms, you must not use our services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using BrokerIn's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use of Service */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              2. Use of Service
            </h2>
            <p className="text-gray-700 mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Use the service in any way that violates any applicable national or international law or regulation</li>
              <li>Transmit any material that is defamatory, offensive, or otherwise objectionable</li>
              <li>Attempt to gain unauthorized access to any portion of the service</li>
              <li>Interfere with or disrupt the service or servers connected to the service</li>
              <li>Use any automated system, including "robots" or "spiders" to access the service</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              3. Account Registration
            </h2>
            <p className="text-gray-700 mb-4">
              To access certain features of our service, you may be required to register for an account. When you register, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept all responsibility for activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          {/* Property Listings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              4. Property Listings and Services
            </h2>
            <p className="text-gray-700 mb-4">
              BrokerIn acts as a platform connecting property owners, service providers, and customers. We do not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Own, sell, or rent properties listed on our platform</li>
              <li>Guarantee the accuracy, completeness, or quality of any listing</li>
              <li>Endorse any property, service, or provider</li>
              <li>Act as an agent for any party in transactions</li>
            </ul>
            <p className="text-gray-700">
              All property details, prices, and availability are provided by listing owners and are subject to change without notice. We recommend verifying all information directly with the property owner or service provider.
            </p>
          </section>

          {/* Booking and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              5. Booking and Payments
            </h2>
            <p className="text-gray-700 mb-4">
              When you make a booking or purchase through our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>You agree to pay all charges associated with your booking</li>
              <li>All prices are subject to change until payment is confirmed</li>
              <li>Payment terms and conditions are as specified at the time of booking</li>
              <li>You are responsible for any additional fees or charges</li>
            </ul>
            <div className="bg-violet-50 border-l-4 border-violet-600 p-4 rounded-r-lg">
              <p className="text-gray-700 font-semibold mb-2">Important:</p>
              <p className="text-gray-700">
                All bookings are subject to availability and confirmation by the property owner or service provider. BrokerIn is not responsible for any disputes between customers and service providers.
              </p>
            </div>
          </section>

          {/* Furniture Rental and Sales */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              6. Furniture Rental and Sales
            </h2>
            <p className="text-gray-700 mb-4">
              For furniture rental and sales transactions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Rental terms, including duration, deposit, and monthly charges, are specified at the time of booking</li>
              <li>You are responsible for maintaining the furniture in good condition during the rental period</li>
              <li>Any damage beyond normal wear and tear will be charged to you</li>
              <li>Delivery and installation charges, if applicable, will be clearly stated</li>
              <li>For sales, ownership transfers upon full payment and delivery</li>
            </ul>
          </section>

          {/* Cancellation and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              7. Cancellation and Refunds
            </h2>
            <p className="text-gray-700 mb-4">
              Cancellation and refund policies vary by service type:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Property bookings: Cancellation terms are specified at the time of booking</li>
              <li>Furniture rentals: Cancellation may be subject to charges as per the rental agreement</li>
              <li>Service bookings: Cancellation policies are service-specific</li>
            </ul>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
              <p className="text-gray-700 font-semibold mb-2">No Refund Policy:</p>
              <p className="text-gray-700">
                Once a booking is confirmed and payment is processed, no refunds will be issued except as required by law or as explicitly stated in the specific service agreement. Please review our <a href="/refund-policy" className="text-violet-600 hover:text-violet-700 underline">Refund Policy</a> for detailed information.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The service and its original content, features, and functionality are and will remain the exclusive property of BrokerIn and its licensors. The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written consent.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, BrokerIn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Your use or inability to use the service</li>
              <li>Any conduct or content of third parties on the service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of transmission to or from the service</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              10. Indemnification
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to defend, indemnify, and hold harmless BrokerIn and its officers, directors, employees, and agents from and against any claims, actions, or demands, including without limitation reasonable legal and accounting fees, arising from your use of the service or your violation of these Terms.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              12. Contact Information
            </h2>
            <div className="bg-violet-50 border-l-4 border-violet-600 p-4 rounded-r-lg">
              <p className="text-gray-700 mb-2">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:info@brokerin.in" className="text-violet-600 hover:text-violet-700 underline">info@brokerin.in</a></li>
                <li><strong>Phone:</strong> <a href="tel:+918310652049" className="text-violet-600 hover:text-violet-700 underline">+91 83106 52049</a> or <a href="tel:+918884704449" className="text-violet-600 hover:text-violet-700 underline">+91 8884704449</a></li>
                <li><strong>Address:</strong> Udayapalya, Kanakapura Road, Bangalore, Karnataka</li>
              </ul>
            </div>
          </section>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <a
            href="/"
            className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium"
          >
            ← Back to Home
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export default TermsAndConditions;


