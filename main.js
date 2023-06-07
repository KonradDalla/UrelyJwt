const chartDiv = document.getElementById("chartdiv");
const showSensorValue = new URLSearchParams(window.location.search).get(
  "showSensorValue"
);
const showCertificate = new URLSearchParams(window.location.search).get(
  "showCertificate"
);
// To hide the chart:
chartDiv.classList.remove("chart-visible");
chartDiv.classList.add("chart-hidden");

// Function to create a nested list from an object
function createNestedList(obj) {
  const ul = document.createElement("ul");
  Object.entries(obj).forEach(([key, value]) => {
    const li = document.createElement("li");
    li.textContent = key + ": ";
    if (typeof value === "object" && value !== null) {
      // If the value is an object, create a nested list
      li.appendChild(createNestedList(value));
    } else {
      // If the value is not an object, display it directly
      li.textContent += value;
    }
    ul.appendChild(li);
  });
  return ul;
}

// Function to create a chart with amCharts
function createChart(data) {
  // Themes begin
  am4core.useTheme(am4themes_animated);
  // Themes end

  // Create chart instance
  var chart = am4core.create("chartdiv", am4charts.XYChart);

  // Add data
  chart.data = [
    {
      type: "bar",
      mid: 2,
      full: 7,
      empty: 1,
      current: data || 3,
    },
  ];

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "type";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.minGridDistance = 20;
  // forcefully widended axis to make it look like gauge
  categoryAxis.renderer.cellStartLocation = -0.12;
  categoryAxis.renderer.cellEndLocation = 1.12;
  categoryAxis.visible = false;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 10;

  // Create series
  function createSeries(field, name, stacked, color, annotate = false) {
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = field;
    series.dataFields.categoryX = "type";
    series.name = name;
    series.columns.template.tooltipText = "{name}: [bold]{valueX}";
    series.stacked = stacked;
    series.columns.template.fill = am4core.color(color);
    const bullet = series.bullets.push(new am4charts.LabelBullet());
    bullet.label.text = "{name}";
    bullet.locationX = 0.5;
    bullet.locationY = 0.5;
    console.log(series);
  }

  createSeries("full", "Full", true, "#c3e6cb"); // Change this color if needed
  createSeries("mid", "Mid", true, "#ffeeba"); // Orange color
  createSeries("empty", "Empty", true, "#f5c6cb"); // Red color

  // draw pointing hand
  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = "current";
  series.dataFields.categoryX = "type";
  series.fillOpacity = 0;
  // hide shape
  series.stroke = am4core.color("rgba(0,0,0,0)");
  // make it ignore other columns
  series.clustered = false;
  // disable tooltips
  series.interactionsEnabled = false;
  const bullet = series.bullets.push(new am4core.Triangle());
  bullet.width = 20;
  bullet.height = 30;
  bullet.fill = am4core.color("red");
  bullet.horizontalCenter = "left"; // This should be 'left' instead of 'middle'
  bullet.verticalCenter = "top";
  bullet.rotation = 90;
  // bullet.locationX = 0; // Set bullet to the left of the column
  bullet.dx = -chart.pixelWidth / 2 + 70; // This property moves the bullet horizontally

  // manually change its position
  // bullet.dy = -65;

  const label = series.bullets.push(new am4charts.LabelBullet());
  label.label.text = "current: {valueY}";
  label.label.dy = 10;
  label.label.dx = -chart.pixelWidth / 2 + 110; // This property moves the label horizontally

  // Add legend
  //chart.legend = new am4charts.Legend();
}

// Function to populate the HTML table with the JWT data
function populateTable(data) {
  const tableBody = document
    .getElementById("data-table")
    .getElementsByTagName("tbody")[0];
  Object.entries(data).forEach(([key, value]) => {
    const row = tableBody.insertRow();
    const keyCell = row.insertCell();
    keyCell.textContent = key;
    const valueCell = row.insertCell();
    if (typeof value === "object" && value !== null) {
      // If the value is an object, display it as a nested list
      valueCell.appendChild(createNestedList(value));
    } else {
      // If the value is not an object, display it directly
      valueCell.textContent = value;
    }
  });
}

// Function to handle the visibility and click action of the download certificate button
function enableCertificate(data) {
  const downloadButton = document.getElementById("download-button");
  if (showCertificate && data.validationStatus === "OK") {
    // If 'downloadCertificate' is true and the validation status is 'OK', make the button visible
    downloadButton.style.display = "block";
    downloadButton.disabled = false;
    // Attach an event listener to the button for downloading the PDF
    downloadButton.addEventListener("click", () => {
      // use the response data to create a PDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 40;
      doc.text(`Generated on:`, 10, y);
      doc.text(`${new Date().toISOString()}`, 90, y);
      y += 10;
      Object.entries(data).forEach(([key, value], index) => {
        if (typeof value === "object") {
          value = JSON.stringify(value, null, 4);
        }
        doc.text(`${key}`, 10, y);
        doc.text(`${value}`, 90, y);
        y += 10;
      });
      doc.save("certificate.pdf");
    });
  } else if (data.validationStatus === "KO") {
    // If the validation status is 'KO', make the button disabled
    downloadButton.disabled = true;
  } else {
    // Otherwise, keep the button invisible
    downloadButton.style.display = "none";
  }
}

// Instantiate JwtModule and use it to verify the JWT token and process the data
const jwtModule = new UrelyJwt(
  "api-key",
  "baseUrl"
);

jwtModule
  .verifyJwtToken()
  .then((data) => {
    // Here we call the function that creates the chart
    if (showSensorValue) {
      // To show the chart:
      chartDiv.classList.remove("chart-hidden");
      chartDiv.classList.add("chart-visible");
      createChart(data.sensorValue);
    }
    // Enable the certificate download button if appropriate
    enableCertificate(data);
    // Populate the HTML table with the JWT data
    populateTable(data);
  })
  .catch((error) => {
    // handle any errors
    console.error(error);
    //Hide the table
    document.getElementById("card-tableId").style.display = "none";
    // Display the error div
    document.getElementById("error-message").classList.remove('d-none');
    // Update the error code and message
    document.getElementById("error-code").textContent += error.code;
    document.getElementById("error-text").textContent += error.message;
  });
