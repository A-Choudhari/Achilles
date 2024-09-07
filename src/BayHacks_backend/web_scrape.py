import requests
from bs4 import BeautifulSoup

def extract_main_text(url, element_type, element_id):
    """Extracts the main text from a given webpage URL.

    Args:
        url (str): The URL of the webpage.

    Returns:
        str: The extracted main text.
    """

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for error HTTP status codes

        soup = BeautifulSoup(response.content, 'html.parser')
        # print(soup)

        # Find the main content element (adjust selector as needed)
        main_content = soup.find(element_type, id=element_id)
        # main_content = soup.find('div', id='cookie-cats')  # for ssl, the id is 'page'

        if main_content:
            text = main_content.get_text()
            return text.strip()
        else:
            print("Unable to find main content element.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None

# Replace with the actual URL you want to extract text from
url1 = "https://www.ssllabs.com/ssltest/analyze.html?d=amazon.com"
#url2 = "https://www.cookieserve.com/scan-summary/?url=amazon.com"

print(extract_main_text(url1, 'div', 'page'))
#print(extract_main_text(url2, 'div', 'cookie-cats'))import requests
from bs4 import BeautifulSoup

def extract_main_text(url, element_type, element_id):
    """Extracts the main text from a given webpage URL.

    Args:
        url (str): The URL of the webpage.

    Returns:
        str: The extracted main text.
    """

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for error HTTP status codes

        soup = BeautifulSoup(response.content, 'html.parser')
        # print(soup)

        # Find the main content element (adjust selector as needed)
        main_content = soup.find(element_type, id=element_id)
        # main_content = soup.find('div', id='cookie-cats')  # for ssl, the id is 'page'

        if main_content:
            text = main_content.get_text()
            return text.strip()
        else:
            print("Unable to find main content element.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None

# Replace with the actual URL you want to extract text from
url1 = "https://www.ssllabs.com/ssltest/analyze.html?d=amazon.com"
#url2 = "https://www.cookieserve.com/scan-summary/?url=amazon.com"

print(extract_main_text(url1, 'div', 'page'))
#print(extract_main_text(url2, 'div', 'cookie-cats'))