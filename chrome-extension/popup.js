// popup.js

document.getElementById('checkCookies').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "checkCookies" }, function(response) {
        console.log("Response: ", response);
        var textarea = document.getElementById('fillData');
        if (response && response.cookieData) {
            // Convert the cookie data to a string for display
            textarea.value = JSON.stringify(response.cookieData, null, 2);
        } else {
            textarea.value = "No cookie data received";
        }
    });
});
