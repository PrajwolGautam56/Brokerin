function Button({ variant = 'primary', children, ...props }) {
  const variants = {
    primary: 'bg-brand-violet text-white hover:bg-brand-violet/90',
    secondary: 'bg-brand-orange text-white hover:bg-brand-orange/90',
    tertiary: 'bg-brand-teal text-white hover:bg-brand-teal/90',
    outline: 'border-2 border-brand-violet text-brand-violet hover:bg-brand-violet/10'
  };

  return (
    <button
      className={`px-6 py-2 rounded-lg transition-colors ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
} 