const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg transition-all',
};

export default function Button({ children, variant = 'primary', className = '', loading, icon, ...props }) {
  return (
    <button className={`${variants[variant]} flex items-center gap-2 ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </button>
  );
}
