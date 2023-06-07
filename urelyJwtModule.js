class UrelyJwt {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // method to parse URL parameters
  getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("jwt");
  }

  // method to make POST request to the server
  async verifyJwtToken() {
    try {
      const jwt = this.getQueryParams();
      const response = await fetch(`${this.baseUrl}/cs/verifytoken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secret: this.apiKey,
        },
        body: JSON.stringify({ jwt }),
      });

      const data = await response.json();

      // If the response status is not OK, throw an error
      if (data.validationStatus === "KO") {
        throw { message: data.error, code: data.validationCode };
      }
      // If the validationStatus is OK, return the response data
      return data;
    } catch (error) {
      throw {
        message: error.message,
        code: "JWT_ERROR", // Add your own error code here
      };
    }
  }
}
