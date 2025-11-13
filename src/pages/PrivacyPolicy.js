import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

function PrivacyPolicy() {
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
            <ShieldCheckIcon className="w-16 h-16 text-violet-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated on <span className="font-semibold">November 12, 2025</span>
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
              This privacy policy sets out how <span className="font-semibold">PRAJWOL GAUTAM</span> uses and protects any information that you give <span className="font-semibold">PRAJWOL GAUTAM</span> when you visit their website and/or agree to purchase from them.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              <span className="font-semibold">PRAJWOL GAUTAM</span> is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, and then you can be assured that it will only be used in accordance with this privacy statement.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              <span className="font-semibold">PRAJWOL GAUTAM</span> may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              Information We Collect
            </h2>
            <p className="text-gray-700 mb-4">We may collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Name</li>
              <li>Contact information including email address</li>
              <li>Demographic information such as postcode, preferences and interests, if required</li>
              <li>Other information relevant to customer surveys and/or offers</li>
            </ul>
          </section>

          {/* What We Do With Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              What We Do With the Information We Gather
            </h2>
            <p className="text-gray-700 mb-4">
              We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Internal record keeping.</li>
              <li>We may use the information to improve our products and services.</li>
              <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
              <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail.</li>
              <li>We may use the information to customise the website according to your interests.</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              How We Use Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
            </p>
            <p className="text-gray-700 mb-4">
              We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
            </p>
            <p className="text-gray-700 mb-4">
              Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
            </p>
            <p className="text-gray-700">
              You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
            </p>
          </section>

          {/* Controlling Personal Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded"></div>
              Controlling Your Personal Information
            </h2>
            <p className="text-gray-700 mb-4">
              You may choose to restrict the collection or use of your personal information in the following ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes</li>
              <li>if you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <a href="mailto:brokerin.in@gmail.com" className="text-violet-600 hover:text-violet-700 underline">brokerin.in@gmail.com</a></li>
            </ul>
            <p className="text-gray-700 mb-4">
              We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
            </p>
            <div className="bg-violet-50 border-l-4 border-violet-600 p-4 rounded-r-lg">
              <p className="text-gray-700">
                If you believe that any information we are holding on you is incorrect or incomplete, please write to <span className="font-semibold">Brigade Meadows Bangalore Rural KARNATAKA 560082</span> or contact us at <a href="tel:8310652049" className="text-violet-600 hover:text-violet-700 underline">8310652049</a> or <a href="mailto:brokerin.in@gmail.com" className="text-violet-600 hover:text-violet-700 underline">brokerin.in@gmail.com</a> as soon as possible. We will promptly correct any information found to be incorrect.
              </p>
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

export default PrivacyPolicy;

