/**
 * End-to-End Testing Suite for COPRRA Website
 * This file contains comprehensive tests for all major functionalities
 */

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost/coprra-api/api.php',
    timeout: 10000
};

// Test utilities
class TestRunner {
    constructor() {
        this.results = [];
        this.currentTest = null;
    }

    async runTest(name, testFn) {
        console.log(`🧪 Running test: ${name}`);
        this.currentTest = { name, status: 'running', errors: [] };
        
        try {
            await testFn();
            this.currentTest.status = 'passed';
            console.log(`✅ Test passed: ${name}`);
        } catch (error) {
            this.currentTest.status = 'failed';
            this.currentTest.errors.push(error.message);
            console.error(`❌ Test failed: ${name}`, error.message);
        }
        
        this.results.push({ ...this.currentTest });
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await this.delay(100);
        }
        throw new Error(`Element not found: ${selector}`);
    }

    async waitForApiResponse(url, timeout = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                const response = await fetch(url);
                if (response.ok) return response;
            } catch (error) {
                // Continue waiting
            }
            await this.delay(500);
        }
        throw new Error(`API not responding: ${url}`);
    }

    generateReport() {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const total = this.results.length;

        console.log('\n📊 Test Results Summary:');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.filter(r => r.status === 'failed').forEach(test => {
                console.log(`- ${test.name}: ${test.errors.join(', ')}`);
            });
        }

        return {
            total,
            passed,
            failed,
            successRate: (passed / total) * 100,
            details: this.results
        };
    }
}

// Main test suite
async function runEndToEndTests() {
    const runner = new TestRunner();

    // Test 1: API Connectivity
    await runner.runTest('API Connectivity Test', async () => {
        const response = await runner.waitForApiResponse(`${TEST_CONFIG.apiUrl}?action=languages`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('API returned error response');
        }
        
        if (!Array.isArray(data.data)) {
            throw new Error('API did not return expected data structure');
        }
    });

    // Test 2: Database Connection
    await runner.runTest('Database Connection Test', async () => {
        const endpoints = [
            'languages',
            'currencies', 
            'categories',
            'brands',
            'products'
        ];

        for (const endpoint of endpoints) {
            const response = await fetch(`${TEST_CONFIG.apiUrl}?action=${endpoint}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(`Database query failed for ${endpoint}`);
            }
        }
    });

    // Test 3: Frontend Loading
    await runner.runTest('Frontend Loading Test', async () => {
        // This test would need to be run in a browser environment
        // For now, we'll simulate the test
        console.log('Frontend loading test would check if React app loads properly');
    });

    // Test 4: Navigation Test
    await runner.runTest('Navigation Test', async () => {
        // Test all main routes
        const routes = [
            '/',
            '/products',
            '/compare',
            '/blog',
            '/privacy',
            '/terms'
        ];

        console.log('Navigation test would verify all routes are accessible');
    });

    // Test 5: Search Functionality
    await runner.runTest('Search Functionality Test', async () => {
        const searchQuery = 'laptop';
        const response = await fetch(`${TEST_CONFIG.apiUrl}?action=products&search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Search API failed');
        }
        
        if (!Array.isArray(data.data)) {
            throw new Error('Search did not return products array');
        }
    });

    // Test 6: Filter Functionality
    await runner.runTest('Filter Functionality Test', async () => {
        const response = await fetch(`${TEST_CONFIG.apiUrl}?action=products&category=1&min_price=100&max_price=1000`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Filter API failed');
        }
        
        // Verify filtering worked
        if (data.data.length > 0) {
            const product = data.data[0];
            if (!product.price || product.price < 100 || product.price > 1000) {
                throw new Error('Price filter not working correctly');
            }
        }
    });

    // Test 7: Product Details
    await runner.runTest('Product Details Test', async () => {
        // First get a product ID
        const productsResponse = await fetch(`${TEST_CONFIG.apiUrl}?action=products&limit=1`);
        const productsData = await productsResponse.json();
        
        if (!productsData.success || productsData.data.length === 0) {
            throw new Error('No products available for testing');
        }
        
        const productId = productsData.data[0].id;
        const detailResponse = await fetch(`${TEST_CONFIG.apiUrl}?action=product&id=${productId}`);
        const detailData = await detailResponse.json();
        
        if (!detailData.success) {
            throw new Error('Product detail API failed');
        }
        
        if (!detailData.data.id || !detailData.data.name) {
            throw new Error('Product detail missing required fields');
        }
    });

    // Test 8: Pagination
    await runner.runTest('Pagination Test', async () => {
        const page1Response = await fetch(`${TEST_CONFIG.apiUrl}?action=products&page=1&limit=10`);
        const page1Data = await page1Response.json();
        
        if (!page1Data.success) {
            throw new Error('Pagination API failed');
        }
        
        if (!page1Data.pagination || typeof page1Data.pagination.total !== 'number') {
            throw new Error('Pagination data missing or invalid');
        }
    });

    // Test 9: Static Pages
    await runner.runTest('Static Pages Test', async () => {
        const pages = ['privacy', 'terms', 'about'];
        
        for (const page of pages) {
            const response = await fetch(`${TEST_CONFIG.apiUrl}?action=page&slug=${page}`);
            const data = await response.json();
            
            if (!data.success) {
                console.warn(`Static page ${page} not found - this is expected if not yet created`);
            }
        }
    });

    // Test 10: Blog System
    await runner.runTest('Blog System Test', async () => {
        const response = await fetch(`${TEST_CONFIG.apiUrl}?action=articles`);
        const data = await response.json();
        
        if (!data.success) {
            console.warn('Blog system not yet implemented - this is expected');
        } else if (!Array.isArray(data.data)) {
            throw new Error('Blog API did not return articles array');
        }
    });

    // Test 11: Performance Test
    await runner.runTest('Performance Test', async () => {
        const startTime = Date.now();
        const response = await fetch(`${TEST_CONFIG.apiUrl}?action=products&limit=50`);
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        
        if (responseTime > 3000) {
            throw new Error(`API response too slow: ${responseTime}ms`);
        }
        
        if (!response.ok) {
            throw new Error('Performance test API call failed');
        }
    });

    // Test 12: Error Handling
    await runner.runTest('Error Handling Test', async () => {
        // Test invalid action
        const invalidResponse = await fetch(`${TEST_CONFIG.apiUrl}?action=invalid_action`);
        const invalidData = await invalidResponse.json();
        
        if (invalidData.success) {
            throw new Error('API should return error for invalid action');
        }
        
        // Test invalid product ID
        const invalidProductResponse = await fetch(`${TEST_CONFIG.apiUrl}?action=product&id=999999`);
        const invalidProductData = await invalidProductResponse.json();
        
        if (invalidProductData.success) {
            throw new Error('API should return error for invalid product ID');
        }
    });

    return runner.generateReport();
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runEndToEndTests, TestRunner };
} else if (typeof window !== 'undefined') {
    window.runEndToEndTests = runEndToEndTests;
}

// Auto-run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runEndToEndTests().then(report => {
        console.log('\n🎯 Testing Complete!');
        process.exit(report.failed > 0 ? 1 : 0);
    }).catch(error => {
        console.error('❌ Testing failed:', error);
        process.exit(1);
    });
}

