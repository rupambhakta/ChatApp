const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden max-h-screen lg:flex items-center justify-center bg-gray-900 py-40">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-blue-500/10 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-400">{title}</h2>
        <p className="text-gray-200">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
