function StatsBanner() {
  const stats = [
    {
      number: '1K+',
      label: 'Properties',
      icon: '🏠',
      color: 'from-violet-500 to-purple-500'
    },
    {
      number: '500+',
      label: 'Happy Customers',
      icon: '😊',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '100+',
      label: 'Verified Listings',
      icon: '✓',
      color: 'from-green-500 to-emerald-500'
    },
    {
      number: '24/7',
      label: 'Support',
      icon: '💬',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className={`text-5xl md:text-6xl font-extrabold text-white mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-white/90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBanner;

