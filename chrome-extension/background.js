// Create the alarm when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Schedule the alarm to run every 15 minutes
    chrome.alarms.create('cookieCheckAlarm', {
        periodInMinutes: 5
    });
});


async function getCookieData() {
    console.log('Running the periodic task...');
    const histories = await getRecentHistory();
    let backendData = [];

    for (const history of histories) {
        const url = new URL(history.url);    
        console.log(url);

        // Wrap the callback-based API in a Promise
        const cookies = await new Promise((resolve) => {
            chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
                console.log(cookies);
                resolve(cookies); // Resolve with the cookies, whether or not they are empty
            });
        });

        // Check the length of cookies and continue to the next iteration if empty
        if (cookies.length === 0) {
            continue;
        } else if(url.hostname === "localhost") {
            continue;
        }

        backendData.push({
            history: history,
            cookies: cookies
        });
    }

    console.log("Cookie Data:", backendData);
    return backendData;
}



function getCSRFToken(callback) {
    chrome.cookies.get({ url: 'http://127.0.0.1:8000', name: 'csrftoken' }, function(cookie) {
        if (cookie) {
            callback(cookie.value);
        } else {
            console.error('CSRF token not found');
        }
    });
}


// Listen for the alarm and execute the desired task
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cookieCheckAlarm') {
        // Trigger the cookie check manually or return a status message
        // sendResponse({ status: "Cookie check initiated..." });
        getCookieData().then((cookieData) => {
            console.log(cookieData);
            chrome.identity.getProfileUserInfo({ 'accountStatus': 'ANY'}, (token) => {
                getCSRFToken((csrfToken) => {
                // Use the token to send authenticated requests to your backend
                    fetch('http://127.0.0.1:8000/api/getCookies', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer: ' + token.email,
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken,
                        },
                        body: JSON.stringify({ "data": cookieData })
                    })
                    .then(response => response.json())
                    .then(data => console.log('Backend response:', data))
                    .catch(error => console.error('Error:', error));
                });
            });
        });
        // rest api. send to backend
    }
});


function getRecentHistory() {
    // Query the history for the 50 most recent entries
    return new Promise((resolve, reject) => {
        chrome.history.search({ text: '', maxResults: 50 }, function (data) {
            // Use a Set to store unique URLs
            const urlSet = [];
            const historyData = [];
            data.forEach(page => {
                const url = new URL(page.url);
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}`;

                // Check if URL is already in the Set
                if (!urlSet.includes(url.hostname)) {
                    // Add URL to Set to track uniqueness
                    urlSet.push(url.hostname);
                    
                    // Add data to historyData array
                    historyData.push({
                        title: url.hostname,
                        url: page.url,
                        lastVisitTime: page.lastVisitTime,
                        visitCount: page.visitCount,
                        faviconUrl: faviconUrl
                    });
                }
            });

            console.log(historyData);
            resolve(historyData);
        });
    });
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkCookies") {
        getCookieData().then(cookieData => {
            console.log("Cookie Data:", cookieData);
            sendResponse({cookieData: cookieData});
        });
        return true;
        
    }
});

