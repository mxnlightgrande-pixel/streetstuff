let map = L.map('map').setView([-33.8688, 151.2093], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

async function loadExcel() {

    const file = document.getElementById('excelFile').files[0];

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    document.getElementById('deliveryList').innerHTML = "";

    for (const row of rows) {

        const deliveryGroup = row["delivery_group"];
        const address = row["address"];
        const suburb = row["suburb"];

        const fullAddress = `${address}, ${suburb}, NSW Australia`;

        // Convert address to coordinates
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
        );

        const result = await response.json();

        if(result.length > 0) {

            const lat = result[0].lat;
            const lon = result[0].lon;

            L.marker([lat, lon])
              .addTo(map)
              .bindPopup(fullAddress);

            document.getElementById('deliveryList').innerHTML += `
              <p>
                <strong>${deliveryGroup}</strong><br>
                ${fullAddress}
              </p>
            `;
        }
    }
}
