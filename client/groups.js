document.addEventListener('DOMContentLoaded', () => {
  const addBillForm = document.querySelector('form');
  addBillForm.addEventListener('submit', handleAddBill);

  fetchCardData();
});

function fetchCardData() {
  fetch('http://localhost:8080/groups')
    .then((response) => response.json())
    .then((data) => {
      displayCardData(data);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error, while fetching the card data. Please try again or later.');
    });
}

function displayCardData(data) {
  const tableBody = document.querySelector('.table-container');

  tableBody.innerHTML = '';

  data.forEach((card) => {
    const row = document.createElement('tr');
    const idCell = document.createElement('td');
    const descriptionCell = document.createElement('td');
    const amountCell = document.createElement('td');

    idCell.textContent = card.id;
    descriptionCell.textContent = card.description;
    amountCell.textContent = card.amount;

    row.appendChild(idCell);
    row.appendChild(descriptionCell);
    row.appendChild(amountCell);

    tableBody.appendChild(row);
  });
}

function handleAddBill(event) {
  event.preventDefault();

  const amount = document.querySelector('#amount').value;
  const description = document.querySelector('#description').value;

  if (!amount || !description) {
    alert('Please enter description.');
    return;
  }

  const billData = {
    amount,
    description,
  };

  fetch('http://localhost:8080/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(billData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      fetchCardData();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('error while adding the bill. Please try again or later.');
    });
}
