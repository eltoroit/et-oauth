# IoT and Other Ideas 

## Device Flow

- Open iPhone and go to my website (myDevice.com)
- Using Bluetooth, talk to the device (handshake)
- Create a new account (username, phone)
- iPhone asks for WiFi credentials
- iPhone gives the device credentials for Wifi network over bluetooth
- Device establishes internet connection
- Device starts oAuth Device flow with Salesforce
- Device receives Salesforce URL + code
- Device sends URL + code to myDevice.com
- iPhone recieves URL + code from myDevice.com
- iPhone opens a browser on the URL
- myDevice.com sends SMS to iPhone
- User on iPhone accepts code received via SMS (automatically)
- User must login to Salesforce (LastPass)


## SMS

-- SMS: https://developer.apple.com/news/?id=z0i801mg

## How to use this on Experience cloud?

Use of frontdoor.jsp to Log in to Salesforce and Experience Cloud Site
- https://help.salesforce.com/s/articleView?id=000332032&type=1
