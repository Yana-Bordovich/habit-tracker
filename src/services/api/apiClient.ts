// Base API client
class ApiClient {
  private baseURL = 'http://localhost:3001';

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { 
        ...options, 
        headers,
        credentials: 'include'
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    // If response is empty (for example, for DELETE requests)
    const contentLength = response.headers.get('Content-Length');
    if (contentLength === '0' || response.status === 204) {
      return { success: true, message: 'Operation completed successfully' };
    }
    
    return response.json();
  }

  private handleError(error: unknown): never {
    console.error('API Request failed:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown API error occurred');
  }

  public get(endpoint: string) {
    return this.request(endpoint);
  }

  public post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();