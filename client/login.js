document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form');
  loginForm.addEventListener('submit', handleLogin);
});

function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  const loginData = {
    email,
    password,
  };

  fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
      } else {
        alert('Login failed. Please check your email and password.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred while logging in. Please try again later.');
    });
}
