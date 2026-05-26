let map = L.map('map').setView([-33.8688, 151.2093], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

async function loadExcel() {

    try {

        const fileInput = document.getElementById('excelFile');

        if (!fileInput.files.length) {
            alert("Please upload an Excel file first.");
            return;
        }

        const file = fileInput.files[0];

        const data = await file.arrayBuffer();

        const workbook = XLSX.read(data);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet);

        console.log(rows);

        document.getElementById('deliveryList').innerHTML = "";

        for (const row of rows) {

            // CHANGE THESE TO MATCH YOUR HEADERS
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

            if (!address || !suburb) {
                console.log("Missing address:", row);
                continue;
            }

            const fullAddress =
                `${address}, ${suburb}, NSW Australia`;

            console.log(fullAddress);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
            );

            const result = await response.json();

            if (result.length > 0) {

                const lat = parseFloat(result[0].lat);
                const lon = parseFloat(result[0].lon);

                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(fullAddress);

                map.setView([lat, lon], 11);

                document.getElementById('deliveryList').innerHTML += `
                    <div style="
                        background:white;
                        padding:10px;
                        margin-bottom:10px;
                        border-radius:12px;
                    ">
                        <strong>${deliveryGroup || "No Group"}</strong><br>
                        ${fullAddress}
                    </div>
                `;

            } else {

                console.log("Address not found:", fullAddress);

            }
        }

    } catch(error) {

        console.error(error);

        alert("Something went wrong. Check console.");

    }
}
