export const fetchWithRefresh = async (url, options = {}) => {
  let accessToken = localStorage.getItem('accessToken');

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };


  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    const refreshResponse = await fetch('http://localhost:5000/user/refresh-token', {
      method: 'POST',
      credentials: 'include', 
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();

      if (refreshData.success && refreshData.accessToken) {
        localStorage.setItem('accessToken', refreshData.accessToken);

        options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
        response = await fetch(url, options);
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  return response;
};
