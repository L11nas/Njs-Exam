document.addEventListener('DOMContentLoaded', () => {
  const addGroupForm = document.querySelector('form');
  addGroupForm.addEventListener('submit', handleAddGroup);
});

function handleAddGroup(event) {
  event.preventDefault();

  const groupIdInput = document.getElementById('group-id');
  const groupId = groupIdInput.value;

  if (!groupId) {
    alert('Please enter group ID.');
    return;
  }

  fetch('http://localhost:8080/bills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ group_id: groupId }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error, please try again or later.');
    });

  groupIdInput.value = '';
}
