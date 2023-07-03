const form = document.getElementById('form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeatPassword').value;

  if (password !== repeatPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      alert(data.message);
    } else {
      throw new Error('Error, Try again.');
    }
  } catch (error) {
    console.error(error);
    alert('Error, Try again.');
  }
});
