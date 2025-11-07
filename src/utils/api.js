/**
 * API client for Cloudey backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  /**
   * Query the AI agent
   */
  async query({ question, modelProvider = 'openai', userId = 1, sessionId }) {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        model_provider: modelProvider,
        user_id: userId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Upload OCI configuration
   */
  async uploadOCIConfig({ email, tenancyOcid, userOcid, fingerprint, region, privateKeyFile }) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('tenancy_ocid', tenancyOcid);
    formData.append('user_ocid', userOcid);
    formData.append('fingerprint', fingerprint);
    formData.append('region', region);
    formData.append('private_key_file', privateKeyFile);

    const response = await fetch(`${API_BASE_URL}/config/oci`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload OCI config');
    }

    return response.json();
  },

  /**
   * Health check
   */
  async health() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};

