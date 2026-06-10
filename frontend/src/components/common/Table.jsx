export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </td>
  );
}

export function Tr({ children, className = '', onClick }) {
  return (
    <tr onClick={onClick} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      {children}
    </tr>
  );
}
