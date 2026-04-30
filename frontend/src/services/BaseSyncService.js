import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class BaseSyncService {
  /**
   * Initializes a sync task and processes the logic
   * @param {Object} data Containing marketplace, and file metadata
   * @param {Function} updateTerminal Callback to render outputs to the UI
   * @param {Function} onComplete Callback when the task is done
   * @param {Function} onError Callback when the task encounters an error
   */
  async triggerSync(data, updateTerminal, onComplete, onError) {
    try {
      updateTerminal(`> Booting Verification Engine...`);
      await this.delay(500);
      
      updateTerminal(`> Analyzing file: ${data.file.name}`);
      await this.delay(500);
      
      updateTerminal(`> Parsing Marketplace: ${data.marketplace}`);
      console.log('[BaseSyncService] Received data:', data);

      const formData = new FormData();
      formData.append('marketplace', data.marketplace);
      formData.append('email', data.email);
      formData.append('file', data.file);

      updateTerminal(`> Establishing secure connection to bridge...`);
      
      const response = await axios.post(`${API_URL}/api/sync/initialize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        updateTerminal(`> Sync Initialized Successfully!`);
        updateTerminal(`> n8n workflow has been triggered.`);
        await this.delay(1000);
        onComplete();
      } else {
        updateTerminal(`> Error: ${response.data.message}`);
        await this.delay(1000);
        if (onError) onError(response.data.message);
      }
    } catch (error) {
      console.error('[BaseSyncService] Sync error:', error);
      updateTerminal(`> Connection Failed!`);
      const errorMsg = error.response?.data?.message || error.message;
      updateTerminal(`> Error: ${errorMsg}`);
      await this.delay(1000);
      if (onError) onError(errorMsg);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
