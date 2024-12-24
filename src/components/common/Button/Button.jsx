// components/common/Button/Button.jsx
export const Button = ({ children, onClick, className = "" }) => {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 bg-[#D8382B] text-white rounded-lg hover:bg-opacity-90 transition-colors ${className}`}
      >
        {children}
      </button>
    );
  };