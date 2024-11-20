
const loading = document.getElementById("loading");
const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");

document.getElementById("file").addEventListener("change", handleFileChange);
//document.getElementById('btnSearch').addEventListener('click', handleSearch);

//variables for storing sheet data and headers
let sheet_data = [];
let headers = [];

/** Check if the selected file is an excel file
 * Read the file as an array buffer.
 */
function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file || !(file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
        return toastr.error("Please select an Excel file (xls or xlsx).");
    }
    toastr.warning(`Be patient while the upload is in progress.`);

    // Use setTimeout to ensure the UI updates before processing the file
    setTimeout(() => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = processFile;
    }, 500);  // Execute after the current call stack is cleared
}

//process the uploaded file
/** Read the file and convert it to JSON
 * Populate the HTML table with valid data.
 */
function processFile(event) {

    try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        sheet_data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: true, defval: "" });

        if (sheet_data.length === 0 || sheet_data[0].length === 0) {
            throw new Error("The Excel file is empty or the first row is empty.");
        }

        headers = sheet_data[0].map(header => header.toUpperCase());

        populateTable(sheet_data.slice(1), headers);
    } catch (error) {
        console.log(error);
        toastr.error(error.message);
    }
}

/** Clear the current table body
 * Loop through the data and create
 * table rows for each record
 * Add checkboxes for selecting rows and set up
 * event listeners to toggle the export button
 */
function populateTable(body, headers) {
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    let cellStyle = "border border-gray-200 px-4 py-2";

    let tableHeadRow = `<tr class='bg-gray-50 sticky top-0 z-10'>
        <th class='${cellStyle}'>
            <input type='checkbox' id='check-all' />
        </th>
        <th class='${cellStyle}'>#</th>`;

    headers.forEach((header) => {
        tableHeadRow += `<th class='${cellStyle}'>${header}</th>`;
    });
    tableHead.innerHTML = tableHeadRow + "</tr>";

    let tableBodyRow = "";
    body.forEach((row, index) => {

        if (row.every(rowElement => rowElement === null || rowElement === "")) return; // Skip this row if it's empty

        tableBodyRow += `<tr>
        <td class='${cellStyle}'>
            <input type='checkbox' class='row-checkbox'>
        </td>
        <td class='${cellStyle} bg-gray-50 sticky left-0'>${index + 1}</td>`;

        row.forEach((rowElement) => {
            tableBodyRow += `<td class='${cellStyle} whitespace-nowrap max-w-[50ch] truncate hover:whitespace-normal'>${rowElement}</td>`;
        });
        tableBodyRow += "</tr>";
    });
    tableBody.innerHTML = tableBodyRow;
    document.getElementById("check-all").addEventListener("change", toggleAllCheckboxes);
}

function toggleAllCheckboxes() {
    const isChecked = document.getElementById("check-all").checked;
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function handleSearch() {
    const searchWord = document.getElementById("txtSearchword").value.toLowerCase();
    const tableRows = document.querySelectorAll('#dtAddressManagement tbody tr');

    tableRows.forEach(row => {
        const rowData = Array.from(row.getElementsByTagName('td')).map(td => td.textContent.toLowerCase());
        const rowMatches = rowData.some(data => data.includes(searchWord));
        row.style.display = rowMatches ? '' : 'none';
    });
}
