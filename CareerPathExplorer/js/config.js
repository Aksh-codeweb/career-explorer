/*********************************
 * AWS CONFIGURATION (SIMPLIFIED)
 *********************************/

window.awsConfig = {
    region: "ap-south-1",

    // 🔐 Cognito User Pool (for login UI only)
    userPoolId: "ap-south-1_vo8AORZve",
    userPoolWebClientId: "4orjkubrmmcmtla5jdr2d94r5f",

    // 🌐API GATEWAY URL (THIS IS YOUR BACKEND)
    journeyApiUrl: "https://z8rr97nn06.execute-api.ap-south-1.amazonaws.com",
    

    translateEnabled: false,
    transcribeEnabled: false
};

/*********************************
 * GLOBAL API ENDPOINTS
 *********************************/

window.API_ENDPOINTS = {
    JOURNEY: 'https://z8rr97nn06.execute-api.ap-south-1.amazonaws.com'
};

window.CLOUDFRONT_DOMAIN = 'https://dvz9jsf7udmwn.cloudfront.net';
/*********************************
 * DEBUG
 *********************************/

console.log("Config loaded:", window.awsConfig);
