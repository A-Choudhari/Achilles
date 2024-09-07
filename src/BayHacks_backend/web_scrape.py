from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from selenium.common.exceptions import TimeoutException
import time
import json

def extract_cookie_text_with_wait(url):
    """Extracts cookie-related information from a given webpage URL, waiting for the page to fully load."""

    # Specify the path to your chromedriver executable
    chromedriver_path = r'C:\Akshat\python\python projects\BayHacks\src\chromedriver.exe'

    # Use Service object to specify the path to the chromedriver
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service)

    # Open the URL in the browser
    driver.get(url)
    while True:
        try:
            # Wait until at least one of the count spans has text different from "--"
            WebDriverWait(driver, 250).until(
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, 'span.count.nessessary-count'), '0') or
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, 'span.count.analytics-count'), '0') or
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, 'span.count.functional-count'), '0') or
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, 'span.count.performance-count'), '0') or
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, 'span.count.advertisement-count'), '0') or
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, 'span.count.other-count'), '0')
            )
            print("Loaded Successfully")
            break
        except TimeoutException:
            print("Not loading. Trying again...")
    # Get the page source after content has been loaded
    page_source = driver.page_source
    
    # Debugging: Print the page source to check what Selenium sees
    # print("Page source captured by Selenium:")
    # print(page_source[:1000])  # Print only the first 1000 characters for debugging

    # Parse the page source with BeautifulSoup
    soup = BeautifulSoup(page_source, 'html.parser')

    # Find all the list items (li) under the div or section where the cookie data is stored
    cookie_data = []
    
    # Assuming the spans are within <li> elements
    cookie_items = soup.find_all('li')

    #print("Cookie Items", cookie_items)

    for item in cookie_items:
        # Find the category label span and the count span
        label_span = item.find('span', class_='cat-label')
        count_spans = [item.find('span', class_='count nessessary-count'), item.find('span', class_='count analytics-count'), 
        item.find('span', class_='count functional-count'), item.find('span', class_='count performance-count'), 
        item.find('span', class_='count advertisement-count'), item.find('span', class_='count other-count')]

        if label_span:
            category = label_span.get_text(strip=True)
            for count_span in count_spans:
                if count_span:
                    count = count_span.get_text(strip=True)
                    if count and count != '--':
                        cookie_data.append({
                            'category': category,
                            'count': count
                        })

    # Debugging: Print cookie_data to verify if anything was found
    print("Extracted cookie data:", cookie_data, "\n\n")
    
    driver.quit()  # Close the browser

    return cookie_data

def cookie_serve_scan(url_to_scan):
    # Replace with the actual URL you want to extract text from
    url = "https://www.cookieserve.com/scan-summary/?url=" + url_to_scan

    cookie_text = extract_cookie_text_with_wait(url)
    # final_output = json.dumps(cookie_text)
    # print(final_output)
    final_output = []
    if cookie_text:
        print(url_to_scan, "analysis:")
        for entry in cookie_text:
            item = f"{entry['category']}: {entry['count']}"
            final_output.append(item)
            print(f"Category: {entry['category']}, Count: {entry['count']}")
    stringifyed_output = json.dumps(final_output)
    print(stringifyed_output)



def extract_grades_text_with_wait(url):
    """Extracts cookie-related information from a given webpage URL, waiting for the page to fully load."""

    # Specify the path to your chromedriver executable
    chromedriver_path = r'C:\Akshat\python\python projects\BayHacks\src\chromedriver.exe'

    # Use Service object to specify the path to the chromedriver
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service)

    # Open the URL in the browser
    driver.get(url)

    try:
        # Wait until at least one of the grades spans has text different from "--"
        driver.implicitly_wait(2)
        # print(EC.invisibility_of_element_located((By.XPATH, "//div[@id='warningBox'][contains(text(), 'Please wait')]")))
        # print(EC.presence_of_element_located((By.CLASS_NAME, "percentage_a")))
        # WebDriverWait(driver, 1000).until(
        # EC.invisibility_of_element_located((By.XPATH, "//div[@id='warningBox'][contains(text(), 'Please wait')]")) and
        # EC.presence_of_element_located((By.CLASS_NAME, "percentage_a"))
        # )

        WebDriverWait(driver, 500).until(
            EC.invisibility_of_element_located((By.ID, "warningBox")))

    except Exception as e:
        print(f"An error occurred: {e}")

    some_unloaded = True
    while some_unloaded:
        some_unloaded = False
        # Get the page source after content has been loaded
        page_source = driver.page_source
        
        # Debugging: Print the page source to check what Selenium sees
        # print("Page source captured by Selenium:")
        # print(page_source[:1000])  # Print only the first 1000 characters for debugging

        # Parse the page source with BeautifulSoup
        soup = BeautifulSoup(page_source, 'html.parser')
        # print("soup", soup)

        # Find all the list items (li) under the div or section where the cookie data is stored
        security_data = []
        
        # Assuming the spans are within <li> elements
        table_items = soup.find_all('td')
        # print("table items", table_items)

        #print("Cookie Items", table_items)

        for item in table_items:
            # Find the category label span and the grades span
            grades_divs = [item.find('div', class_='percentage_a'), item.find('div', class_='percentage_g')]

            for grades_div in grades_divs:
                if grades_div:
                    grades = grades_div.get_text(strip=True)
                    if grades == "-":
                        some_unloaded = True
                    if grades:
                        security_data.append(grades)

    grades_div_alt = soup.find('div', class_='rating_g')
    if grades_div_alt:
        grades_alt = grades_div_alt.get_text(strip=True)
        if grades_alt:
            security_data.append(grades_alt)

    # Debugging: Print security_data to verify if anything was found
    # print("Extracted data:", security_data, "\n\n")
    
    driver.quit()  # Close the browser

    return security_data

def ssl_scan(url_to_scan):
    # Replace with the actual URL you want to extract text from
    url = "https://www.ssllabs.com/ssltest/analyze.html?d=" + url_to_scan

    grades_text = extract_grades_text_with_wait(url)

    if grades_text:
        print(url_to_scan, "analysis:")
        for entry in grades_text:
            print(entry)
        return grades_text
    else:
        return None
