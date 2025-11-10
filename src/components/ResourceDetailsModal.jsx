import { useState } from 'react';
import { X, Download, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResourceDetailsModal({ isOpen, onClose, data, title, type }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  if (!isOpen || !data) return null;

  // Filter data based on search
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.compartment && item.compartment.toLowerCase().includes(searchLower))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, endIdx);

  // Export to CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Get column headers from first item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(item => 
        headers.map(header => {
          const value = item[header];
          // Handle values that might contain commas
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type || 'resources'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get columns based on type
  const getColumns = () => {
    if (!data || data.length === 0) return [];
    
    const firstItem = data[0];
    const allKeys = Object.keys(firstItem);
    
    // Exclude OCID from display (but keep in CSV)
    return allKeys.filter(key => key !== 'ocid');
  };

  const columns = getColumns();

  // Format cell value
  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';
    
    // Format numbers
    if (key.includes('cost') || key.includes('savings')) {
      return `$${Number(value).toFixed(2)}`;
    }
    if (key.includes('size_gb')) {
      return `${value} GB`;
    }
    if (key.includes('percent')) {
      return value !== null ? `${Number(value).toFixed(1)}%` : 'N/A';
    }
    if (key.includes('vcpus')) {
      return `${value} vCPUs`;
    }
    if (key.includes('memory_gb')) {
      return `${value} GB`;
    }
    
    return String(value);
  };

  // Format column header
  const formatHeader = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700">
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-sm text-primary-100 mt-1">
                  Showing {filteredData.length} of {data.length} total resources
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 border border-white/30"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export CSV</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or compartment..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                      >
                        {formatHeader(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {formatValue(column, item[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredData.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No resources found matching your search.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing {startIdx + 1}-{Math.min(endIdx, filteredData.length)} of {filteredData.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

