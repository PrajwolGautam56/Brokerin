function PlaceholderImage() {
  return (
    <svg
      className="w-full h-full text-gray-200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      fill="currentColor"
      viewBox="0 0 640 640"
      aria-hidden="true"
    >
      <rect width="100%" height="100%" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#6B7280"
        fontSize="24"
      >
        No Image Available
      </text>
    </svg>
  );
}

export default PlaceholderImage; 