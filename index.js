require("dotenv").config();
const crypto = require("crypto");

const TalonOne = require("talon_one");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  const defaultClient = TalonOne.ApiClient.instance;
  const apiPath = process.env.API_BASE_URL || "http://localhost:9000"; // No trailing slash!
  defaultClient.basePath = apiPath;

  // Configure API key authorization: api_key_v1
  const api_key_v1 = defaultClient.authentications["api_key_v1"];
  api_key_v1.apiKey = process.env.API_KEY || "";
  api_key_v1.apiKeyPrefix = "ApiKey-v1";

  // Integration API example to send a session update
  const integrationApi = new TalonOne.IntegrationApi();
  // integrationApi.apiClient.timeout = 1000;
  const abortCallback = (reject) => {
    console.log("Custom abort callback executed");
    reject({ error: { code: "CUSTOM_ABORTED", message: "Request aborted" } });
  };
  try {
    const id = crypto.randomUUID();
    console.log(id);
    const promise = integrationApi.apiClient.callApi(
      `/v2/customer_sessions/${id}`,
      "PUT",
      {}, // path params
      {}, // query params
      { Authorization: `ApiKey-v1 ${process.env.API_KEY}` }, // header params
      {}, // form params
      {
        customerSession: {
          state: "closed",
          cartItems: [
            {
              name: "pizza",
              sku: "pizza",
              quantity: 1,
              price: 100,
              attributes: {},
            },
          ],
        },
      }, // body
      [],
      ["application/json"],
      ["application/json"],
      "Object",
      null,
      abortCallback
    );
    let isPending = true;
    const timeoutId = setTimeout(() => {
      if (isPending) {
        promise.cancel();
      }
    }, 20);
    const res = await promise;
    isPending = false;
    clearTimeout(timeoutId);
    console.log(res);
  } catch (err) {
    console.log(err);
  }
})();
