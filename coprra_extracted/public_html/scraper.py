import requests
from bs4 import BeautifulSoup
import json

def scrape_product_price(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        soup = BeautifulSoup(response.text, 'html.parser')

        # This is a placeholder. Actual scraping logic will depend on the target website's HTML structure.
        # We need to identify specific HTML elements (e.g., div, span with specific classes/ids) that contain product name, price, and availability.
        # For demonstration, let's assume we are looking for a product title and a price.
        
        product_name = soup.find('h1', class_='product-title') # Example selector
        price = soup.find('span', class_='product-price') # Example selector
        availability = soup.find('div', class_='product-availability') # Example selector

        product_data = {
            'name': product_name.get_text(strip=True) if product_name else 'N/A',
            'price': price.get_text(strip=True) if price else 'N/A',
            'availability': availability.get_text(strip=True) if availability else 'N/A',
            'url': url
        }
        return product_data
    except requests.exceptions.RequestException as e:
        return {'error': f'Request failed: {e}'}
    except Exception as e:
        return {'error': f'An error occurred during scraping: {e}'}

if __name__ == '__main__':
    # Example usage (this URL will not work for actual scraping as it's generic)
    # Replace with actual product URLs from e-commerce sites
    example_url = 'https://www.example.com/product/123'
    data = scrape_product_price(example_url)
    print(json.dumps(data, indent=4))


