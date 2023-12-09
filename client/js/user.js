let user = getUser();

async function getUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location = '/login.html';
    return;
  }

  const response = await fetch('/api/auth/validate', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    localStorage.removeItem('token');
    window.location = '/login.html';
    return;
  }

  const data = await response.json();
  console.log(data);
  return data;
}
