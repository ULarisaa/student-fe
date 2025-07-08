export const fetchWithRefresh = async (url, options = {}) => {
  let accessToken = localStorage.getItem('accessToken');

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, options);

  // Dacă tokenul a expirat (401 sau 403), încerci să-l reîmprospătezi
  if (response.status === 401 || response.status === 403) {
    const refreshResponse = await fetch('http://localhost:5000/user/refresh-token', {
      method: 'POST',
      credentials: 'include', 
    });
    console.log("test");
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();

      if (refreshData.success && refreshData.accessToken) {
        localStorage.setItem('accessToken', refreshData.accessToken);

        // retrimite cererea originală cu noul token
        options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
        response = await fetch(url, options);
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      // refreshToken invalid sau expirat
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  return response;
};
