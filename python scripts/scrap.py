import json
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Load JSON data
with open(r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\public\data.json', 'r') as file:
    problems = json.load(file)

# Setup Selenium WebDriver (Chrome)
options = Options()
options.add_argument('--headless')  # Run in headless mode (no browser UI)
options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
service = Service(r"C:\Users\Tuan Le\OneDrive\Desktop\code projects\chromedriver.exe")  # Replace with your actual path
driver = webdriver.Chrome(service=service, options=options)

for problem in problems:
    url = problem.get('url')
    if url:
        # Navigate to the URL
        driver.get(url)
        
        try:
            # Wait for the difficulty elements to load
            difficulty_elements = WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located((By.XPATH, "//div[contains(@class, 'text-difficulty')]"))
            )
            
            # Extract difficulty level from the elements
            difficulty_text = None
            for element in difficulty_elements:
                text = element.text.strip()
                if text in ['Easy', 'Medium', 'Hard']:
                    difficulty_text = text
                    break
            
            if difficulty_text:
                if problem['difficulty'] != difficulty_text:
                    # Update the problem's difficulty in the JSON data
                    problem['difficulty'] = difficulty_text
                    print(f"Updated {problem['name']} to difficulty: {difficulty_text}")
                else:
                    print(f"No change needed for {problem['name']}.")
            else:
                print(f"Difficulty level not found for {problem['name']} at {url}")
        
        except Exception as e:
            print(f"Failed to scrape {problem['name']} at {url}: {e}")
        
        # Random delay between requests to mimic human behavior
        time.sleep(random.randint(2, 7))

# Close the browser
driver.quit()

# Save the updated JSON data
with open(r'C:\Users\Tuan Le\OneDrive\Desktop\code projects\leetcode-tracker\public\data.json', 'w') as file:
    json.dump(problems, file, indent=2)

print("All problems updated successfully.")
