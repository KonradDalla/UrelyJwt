# JWT Verification and Dynamic Content Generation

This project is a demonstration of JWT verification, dynamic chart creation with amCharts, PDF generation with jsPDF, and dynamic table population based on JSON data.

## JwtModule

The `JwtModule` is a JavaScript module for verifying JSON Web Tokens (JWTs). It takes two parameters during instantiation: the secret and the URL from which to fetch the JWT.

```javascript
const jwtModule = new JwtModule(
  "your-secret",
  "http://your-url.com"
);
```
The `verifyJwtToken` function is used to verify the JWT and returns a promise which resolves with the verified data.

### Example

```javascript
jwtModule
  .verifyJwtToken()
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });
```

## Features

### 1. Displaying a Chart with amCharts

If the verified JWT data contains `showSensorValue` as `true` and a `sensorValue` field, a chart is displayed using amCharts library.

```javascript
if (data.showSensorValue) {
  createChart(data.sensorValue);
}
```

### 2. Generating a Dynamic PDF Certificate

If the verified JWT data contains a `downloadCertificate` field set to `true` and the `validationStatus` is `OK`, a button becomes visible enabling the user to download a dynamically generated PDF certificate containing the JWT data. The certificate is generated using jsPDF library.

```javascript
if (data.downloadCertificate && data.validationStatus === "OK") {
  enableCertificate(data);
}
```

### 3. Populating an HTML Table with JWT Data

If the JWT verification is successful and the `validationStatus` is `OK`, an HTML table is populated with the JWT data. Nested JSON objects are displayed as nested lists.

```javascript
if (data.validationStatus === "OK") {
  populateTable(data);
}
```

## Running the Project

To run the project, you need to have a web server to bypass CORS restrictions. You can use Python's built-in HTTP server for this:

1. Run `python -m http.server` (Python 3) or `python -m SimpleHTTPServer` (Python 2) in the terminal from the project directory.

2. Open a web browser and go to `http://localhost:8000`.

You should see the chart, PDF download button (if applicable), and the data table populated with data from the verified JWT.

Please replace `"your-secret"` and `"http://your-url.com"` with your actual secret and URL during the JwtModule instantiation.