let map = L.map('map').setView([-33.8688, 151.2093], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let allStops = [];

async function loadExcel() {

    try {

        // Clear previous markers
        allStops = [];

        document.getElementById('deliveryList').innerHTML = "";

        const fileInput = document.getElementById('excelFile');

        if (!fileInput.files.length) {
            alert("Please upload an Excel file.");
            return;
        }

        const file = fileInput.files[0];

        const data = await file.arrayBuffer();

        const workbook = XLSX.read(data);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet);

        console.log(rows);

        for (const row of rows) {

            // Flexible column matching
            const deliveryGroup =
                row["delivery_group"] ||
                row["delivery_group_"] ||
                row["Delivery Group"];

            const address =
                row["address"] ||
                row["Address"];

            const suburb =
                row["suburb"] ||
                row["Suburb"];

            if (!address || !suburb) continue;

            const fullAddress =
                `${address}, ${suburb}, NSW Australia`;

            // Geocode address
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
            );

            const result = await response.json();

            if (result.length > 0) {

                const lat = parseFloat(result[0].lat);
                const lon = parseFloat(result[0].lon);

                allStops.push(fullAddress);

                // Add marker
                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(`
                        <strong>${deliveryGroup || "No Group"}</strong>
                        <br>
                        ${fullAddress}
                    `);

                map.setView([lat, lon], 11);

                // Add delivery card
                document.getElementById('deliveryList').innerHTML += `
                    <div style="
                        background:white;
                        padding:12px;
                        margin-bottom:10px;
                        border-radius:16px;
                        box-shadow:0 2px 8px rgba(0,0,0,0.1);
                    ">
                        <strong>${deliveryGroup || "No Group"}</strong>
                        <br>
                        ${fullAddress}
                    </div>
                `;
            }
        }

        // Add Google Maps Button
        if (allStops.length > 0) {

            let mapsURL =
                "https://www.google.com/maps/dir/";

            allStops.forEach(stop => {
                mapsURL += encodeURIComponent(stop) + "/";
            });

            document.getElementById('deliveryList').innerHTML += `
                <button
                    onclick="window.open('${mapsURL}', '_blank')"
                    style="
                        width:100%;
                        padding:16px;
                        background:#34A853;
                        color:white;
                        border:none;
                        border-radius:18px;
                        font-size:18px;
                        cursor:pointer;
                        margin-top:20px;
                    "
                >
                    Open Route in Google Maps
                </button>
            `;
        }

    } catch(error) {

        console.error(error);

        alert("Error loading Excel file.");

    }
}
