import requests
from bs4 import BeautifulSoup
import json

def scrape_product_price(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Scraping for webscraper.io test site
        product_name_element = soup.find('h4', class_='title card-title')
        price_element = soup.find('h4', class_='pull-right price')
        description_element = soup.find('p', class_='description')

        product_data = {
            'name': product_name_element.get_text(strip=True) if product_name_element else 'N/A',
            'price': price_element.get_text(strip=True) if price_element else 'N/A',
            'description': description_element.get_text(strip=True) if description_element else 'N/A',
            'url': url
        }
        return product_data
    except requests.exceptions.RequestException as e:
        return {'error': f'Request failed: {e}'}
    except Exception as e:
        return {'error': f'An error occurred during scraping: {e}'}

if __name__ == '__main__':
    # Test with webscraper.io test site
    test_url = 'https://webscraper.io/test-sites/e-commerce/allinone/product/60'
    data = scrape_product_price(test_url)
    print(json.dumps(data, indent=4))

