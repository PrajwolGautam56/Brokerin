import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function RefundPolicy() {
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
            <ExclamationTriangleIcon className="w-16 h-16 text-violet-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Refund Policy
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
              This Refund Policy ("Policy") outlines the terms and conditions regarding refunds for services provided by <span className="font-semibold">BrokerIn</span>. Please read this Policy carefully before making any booking or purchase.
            </p>
          </section>

          {/* General Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              1. General Refund Policy
            </h2>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg mb-4">
              <p className="text-gray-700 font-semibold text-lg mb-2">
                ⚠️ No Refund After Booking
              </p>
              <p className="text-gray-700">
                Once a booking is confirmed and payment is processed, <strong>no refunds will be issued</strong> except as required by applicable law or as explicitly stated in specific circumstances outlined below.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              This policy applies to all services provided through BrokerIn, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>Property rentals and bookings</li>
              <li>Furniture rentals and purchases</li>
              <li>Service bookings (cleaning, maintenance, etc.)</li>
              <li>PG/Hostel bookings</li>
              <li>Any other services offered on our platform</li>
            </ul>
          </section>

          {/* Property Bookings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              2. Property Bookings
            </h2>
            <p className="text-gray-700 mb-4">
              For property rental and booking services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>No Refunds:</strong> Once a property booking is confirmed and payment is made, no refunds will be issued for cancellations, no-shows, or early departures.</li>
              <li><strong>Security Deposits:</strong> Security deposits are refundable only after the completion of the rental period, subject to property inspection and deduction of any damages or outstanding charges.</li>
              <li><strong>Advance Payments:</strong> Advance payments made for property bookings are non-refundable.</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg">
              <p className="text-gray-700">
                <strong>Note:</strong> In case of exceptional circumstances (natural disasters, property unavailability due to our error, etc.), refunds may be considered on a case-by-case basis at BrokerIn's sole discretion.
              </p>
            </div>
          </section>

          {/* Furniture Rentals and Sales */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              3. Furniture Rentals and Sales
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">Furniture Rentals:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>No Refunds:</strong> Once a furniture rental is confirmed and payment is processed, no refunds will be issued for cancellations.</li>
              <li><strong>Monthly Rentals:</strong> Monthly rental payments are non-refundable. If you cancel mid-month, you will not receive a refund for the remaining days of that month.</li>
              <li><strong>Deposits:</strong> Security deposits are refundable only after the furniture is returned in good condition, subject to inspection and deduction of any damages or outstanding charges.</li>
              <li><strong>Early Termination:</strong> Early termination of rental agreements may be subject to penalties as specified in the rental agreement. No refunds will be issued for unused rental periods.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Furniture Sales:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>No Refunds:</strong> All furniture sales are final. Once payment is processed and the furniture is delivered, no refunds or returns will be accepted unless the item is defective or not as described.</li>
              <li><strong>Defective Items:</strong> If you receive a defective item or an item that does not match the description, you must report it within 48 hours of delivery. We will arrange for replacement or refund at our discretion.</li>
              <li><strong>Damage During Delivery:</strong> If furniture is damaged during delivery, you must report it immediately. We will arrange for replacement or repair at no additional cost.</li>
            </ul>
          </section>

          {/* Service Bookings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              4. Service Bookings
            </h2>
            <p className="text-gray-700 mb-4">
              For service bookings (cleaning, maintenance, repairs, etc.):
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>No Refunds:</strong> Once a service is booked and payment is processed, no refunds will be issued for cancellations made less than 24 hours before the scheduled service time.</li>
              <li><strong>Cancellation Window:</strong> Cancellations made more than 24 hours in advance may be eligible for a credit or rescheduling, but no cash refunds will be issued.</li>
              <li><strong>Service Completion:</strong> If a service is not completed satisfactorily, you must report it within 24 hours. We will arrange for re-service or partial refund at our discretion.</li>
            </ul>
          </section>

          {/* Payment Processing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              5. Payment Processing and Refunds
            </h2>
            <p className="text-gray-700 mb-4">
              In the rare event that a refund is approved:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Refunds will be processed to the original payment method used for the transaction</li>
              <li>Processing time may take 7-14 business days depending on your payment provider</li>
              <li>Any transaction fees or charges are non-refundable</li>
              <li>Refunds will be issued in the same currency as the original payment</li>
            </ul>
          </section>

          {/* Disputes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              6. Disputes and Complaints
            </h2>
            <p className="text-gray-700 mb-4">
              If you have a complaint or dispute regarding a booking or service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Contact us immediately at <a href="mailto:info@brokerin.in" className="text-violet-600 hover:text-violet-700 underline">info@brokerin.in</a> or call us at <a href="tel:+918310652049" className="text-violet-600 hover:text-violet-700 underline">+91 83106 52049</a></li>
              <li>Provide detailed information about your complaint, including booking reference number, date, and description of the issue</li>
              <li>We will investigate your complaint and respond within 5-7 business days</li>
              <li>All disputes will be resolved in accordance with applicable laws and regulations</li>
            </ul>
          </section>

          {/* Legal Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              7. Your Legal Rights
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nothing in this Policy affects your statutory rights as a consumer. If you are a consumer, you have certain rights under consumer protection laws that cannot be excluded or limited. This Policy does not affect those rights.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any changes constitutes your acceptance of the new Policy. We encourage you to review this Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              9. Contact Us
            </h2>
            <div className="bg-violet-50 border-l-4 border-violet-600 p-4 rounded-r-lg">
              <p className="text-gray-700 mb-2">
                If you have any questions about this Refund Policy, please contact us:
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

export default RefundPolicy;

