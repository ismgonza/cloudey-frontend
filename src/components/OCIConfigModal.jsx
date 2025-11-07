import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function OCIConfigModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    tenancyOcid: '',
    userOcid: '',
    fingerprint: '',
    region: 'us-ashburn-1',
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a private key file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.uploadOCIConfig({
        ...formData,
        privateKeyFile: file,
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">OCI Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload your Oracle Cloud Infrastructure credentials
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your-email@example.com"
              />
            </div>

            {/* Tenancy OCID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenancy OCID
              </label>
              <input
                type="text"
                required
                value={formData.tenancyOcid}
                onChange={(e) => setFormData({ ...formData, tenancyOcid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ocid1.tenancy.oc1..."
              />
            </div>

            {/* User OCID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User OCID
              </label>
              <input
                type="text"
                required
                value={formData.userOcid}
                onChange={(e) => setFormData({ ...formData, userOcid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ocid1.user.oc1..."
              />
            </div>

            {/* Fingerprint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fingerprint
              </label>
              <input
                type="text"
                required
                value={formData.fingerprint}
                onChange={(e) => setFormData({ ...formData, fingerprint: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="us-ashburn-1">US East (Ashburn)</option>
                <option value="us-phoenix-1">US West (Phoenix)</option>
                <option value="eu-frankfurt-1">EU (Frankfurt)</option>
                <option value="uk-london-1">UK (London)</option>
                <option value="ap-tokyo-1">Asia Pacific (Tokyo)</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Key File (.pem)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pem"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : 'Choose a .pem file'}
                  </span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-900"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900"
              >
                <Check className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Configuration uploaded successfully!</p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || success}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Uploading...' : success ? 'Success!' : 'Upload Configuration'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

