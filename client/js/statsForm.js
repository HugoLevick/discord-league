function addRow() {
  const table = document.getElementById('dataTable');
  const newRow = table.insertRow(table.rows.length);

  for (const columnIndex in columns) {
    const column = columns[columnIndex];

    const cell = newRow.insertCell(columnIndex);
    const input = document.createElement('input');
    input.type = column.type;
    input.className =
      column.type === 'checkbox' ? 'form-check-input' : 'form-control';
    input.name = column.name;
    input.placeholder = `Enter ${column.displayName}`;
    cell.appendChild(input);
  }

  const actionCell = newRow.insertCell(columns.length);
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn btn-danger';
  removeButton.textContent = 'Remove';
  removeButton.onclick = function () {
    removeRow(this);
  };
  actionCell.appendChild(removeButton);
}

function removeRow(button) {
  const row = button.parentNode.parentNode;
  row.remove();
}

async function sendTableData(event) {
  event.preventDefault();
  const table = document.getElementById('dataTable');
  const tableData = [];

  for (let i = 1; i < table.rows.length; i++) {
    const rowData = {};
    const row = table.rows[i];

    for (const column of columns) {
      const input = row.querySelector(`input[name="${column.name}"]`);
      if (input.value === '') {
        if (!column.nullable) {
          alert(`Value missing for '${column.displayName}'`);
          return;
        }
      } else if (input.type === 'checkbox') {
        rowData[column.name] = input.checked;
      } else if (input.type === 'number') {
        if (isNaN(+input.value)) {
          alert(`Invalid number for '${column.displayName}'`);
          return;
        }
        rowData[column.name] = +input.value;
      }
    }
    tableData.push(rowData);
  }

  if (!discordId) {
    alert('You need to select a player to upload stats!');
    return;
  }

  await fetch('api/players/uploadStats/' + discordId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stats: tableData }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      console.log(res);
      alert('Stats uploaded successfully!');
      location.reload();
    })
    .catch((err) => {
      alert('Error uploading stats!');
      console.error(err);
    });
}

document.forms['dataForm'].addEventListener('submit', sendTableData);
