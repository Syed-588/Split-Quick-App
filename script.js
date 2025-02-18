let history = [];
let chartInstance = null; // Store the chart instance to destroy it later

function changeTheme(theme) {
    document.body.classList.remove('warm-theme', 'cool-theme', 'fresh-theme');
    if (theme === 'theme1') {
        document.body.classList.add('warm-theme');
    } else if (theme === 'theme2') {
        document.body.classList.add('cool-theme');
    } else if (theme === 'theme3') {
        document.body.classList.add('fresh-theme');
    }
}

function calculateSplit() {
    let totalAmount = parseFloat(document.getElementById("totalAmount").value);
    let tipPercentage = parseFloat(document.getElementById("tip").value) || 0;
    let numPeople = parseInt(document.getElementById("numPeople").value);
    let customSplitEnabled = document.getElementById("customSplitToggle").checked;
    let historyList = document.getElementById("history");

    if (isNaN(totalAmount) || totalAmount <= 0 || isNaN(numPeople) || numPeople <= 0) {
        alert("Please enter valid numbers.");
        return;
    }

    let tipAmount = (totalAmount * tipPercentage) / 100;
    let finalAmount = totalAmount + tipAmount;

    let amounts = [];
    if (customSplitEnabled) {
        let customAmounts = document.getElementsByClassName("customAmount");
        let totalCustom = 0;
        for (let input of customAmounts) {
            let value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                alert("Invalid custom amounts.");
                return;
            }
            totalCustom += value;
            amounts.push(value);
        }

        if (Math.abs(totalCustom - finalAmount) > 0.01) {
            alert("Custom amounts must add up to total.");
            return;
        }
    } else {
        let baseAmount = Math.floor((finalAmount / numPeople) * 100) / 100;
        let remainder = finalAmount - baseAmount * numPeople;

        for (let i = 0; i < numPeople; i++) {
            amounts.push(baseAmount + (i < remainder * 100 ? 0.01 : 0));
        }
    }

    let resultText = `Each person pays: \n${amounts.map((amt, i) => `Person ${i + 1}: $${amt.toFixed(2)}`).join("\n")}`;

    // Save to history
    history.push({ totalAmount, tipPercentage, numPeople, amounts, resultText });
    updateHistory();

    document.getElementById("result").innerText = resultText;

    renderChart(amounts);
}

function updateHistory() {
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";

    history.forEach(entry => {
        let historyItem = document.createElement("li");
        historyItem.innerText = `Bill: $${entry.totalAmount.toFixed(2)}, Tip: ${entry.tipPercentage}%, People: ${entry.numPeople}, Split: ${entry.amounts.map(a => `$${a.toFixed(2)}`).join(", ")}`;
        historyList.appendChild(historyItem);
    });
}

function renderChart(amounts) {
    // Destroy the previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    let ctx = document.getElementById("splitChart").getContext("2d");

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: amounts.map((_, i) => `Person ${i + 1}`),
            datasets: [{
                data: amounts,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff5733', '#c70039', '#900c3f']
            }]
        }
    });
}

document.getElementById("toggleDarkMode").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    document.getElementById("appTitle").classList.toggle("dark-mode");
    document.getElementById("history").classList.toggle("dark-mode"); // Ensure history text is white in dark mode
});

document.getElementById("customSplitToggle").addEventListener("change", function() {
    let customSplitsDiv = document.getElementById("customSplits");
    let numPeople = parseInt(document.getElementById("numPeople").value);
    customSplitsDiv.innerHTML = ""; // Clear previous fields

    if (this.checked) {
        for (let i = 0; i < numPeople; i++) {
            let input = document.createElement("input");
            input.type = "number";
            input.classList.add("customAmount");
            input.placeholder = `Amount for Person ${i + 1}`;
            input.min = "0"; // Prevent negative values
            input.step = "0.01"; // Allow decimal values
            customSplitsDiv.appendChild(input);
        }
    }
});

// Prevent negative or non-number inputs and disable scroll wheel
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0; // Set the value to 0 if it's negative
        }
    });

    input.addEventListener('wheel', function(e) {
        e.preventDefault(); // Prevent scroll wheel changes
    });
});
