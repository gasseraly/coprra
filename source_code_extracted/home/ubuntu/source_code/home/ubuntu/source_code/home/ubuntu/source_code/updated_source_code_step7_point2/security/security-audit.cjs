/**
 * Security Audit System for COPRRA Website
 * Comprehensive security testing and vulnerability assessment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Security audit configuration
const SECURITY_CONFIG = {
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    sessionTimeout: 3600, // 1 hour
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    requiredHeaders: [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Content-Security-Policy'
    ]
};

// Security test results storage
let securityResults = [];

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '🔴' : type === 'warning' ? '🟡' : type === 'success' ? '🟢' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function addResult(testName, status, severity, message, recommendation = '') {
    securityResults.push({
        testName,
        status,
        severity, // 'critical', 'high', 'medium', 'low', 'info'
        message,
        recommendation,
        timestamp: new Date().toISOString()
    });
}

// Security test functions
async function testSQLInjectionProtection() {
    log('Testing SQL Injection Protection...');
    
    try {
        // Check API files for SQL injection vulnerabilities
        const apiFiles = [];
        
        // Find all PHP files that might contain SQL queries
        const searchPaths = [
            path.join(__dirname, '..', 'api.php'),
            path.join(__dirname, '..', '..', 'deployable_files_step6', 'api.php'),
            path.join(__dirname, '..', 'api'),
            path.join(__dirname, '..', 'config.php')
        ];
        
        for (const searchPath of searchPaths) {
            if (fs.existsSync(searchPath)) {
                if (fs.statSync(searchPath).isDirectory()) {
                    const files = fs.readdirSync(searchPath);
                    files.forEach(file => {
                        if (file.endsWith('.php')) {
                            apiFiles.push(path.join(searchPath, file));
                        }
                    });
                } else if (searchPath.endsWith('.php')) {
                    apiFiles.push(searchPath);
                }
            }
        }
        
        let vulnerableFiles = [];
        let protectedFiles = [];
        
        for (const file of apiFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for dangerous patterns
            const dangerousPatterns = [
                /\$_GET\[.*?\].*?mysql_query/gi,
                /\$_POST\[.*?\].*?mysql_query/gi,
                /\$_REQUEST\[.*?\].*?mysql_query/gi,
                /query\s*\(\s*['"]\s*SELECT.*?\$_/gi,
                /query\s*\(\s*['"]\s*INSERT.*?\$_/gi,
                /query\s*\(\s*['"]\s*UPDATE.*?\$_/gi,
                /query\s*\(\s*['"]\s*DELETE.*?\$_/gi
            ];
            
            // Check for protection patterns
            const protectionPatterns = [
                /prepare\s*\(/gi,
                /mysqli_real_escape_string/gi,
                /filter_var/gi,
                /htmlspecialchars/gi,
                /bindParam/gi,
                /bindValue/gi
            ];
            
            let hasVulnerability = false;
            let hasProtection = false;
            
            for (const pattern of dangerousPatterns) {
                if (pattern.test(content)) {
                    hasVulnerability = true;
                    break;
                }
            }
            
            for (const pattern of protectionPatterns) {
                if (pattern.test(content)) {
                    hasProtection = true;
                    break;
                }
            }
            
            if (hasVulnerability && !hasProtection) {
                vulnerableFiles.push(file);
            } else if (hasProtection) {
                protectedFiles.push(file);
            }
        }
        
        if (vulnerableFiles.length > 0) {
            addResult(
                'SQL Injection Protection',
                'failed',
                'critical',
                `Found ${vulnerableFiles.length} potentially vulnerable files: ${vulnerableFiles.join(', ')}`,
                'Use prepared statements or proper input sanitization for all database queries'
            );
        } else if (protectedFiles.length > 0) {
            addResult(
                'SQL Injection Protection',
                'passed',
                'info',
                `Found ${protectedFiles.length} files with SQL injection protection`,
                'Continue using prepared statements and input validation'
            );
        } else {
            addResult(
                'SQL Injection Protection',
                'warning',
                'medium',
                'No SQL queries found in scanned files',
                'Ensure all future database interactions use prepared statements'
            );
        }
        
    } catch (error) {
        addResult(
            'SQL Injection Protection',
            'error',
            'high',
            `Error during SQL injection test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function testXSSProtection() {
    log('Testing XSS Protection...');
    
    try {
        const frontendFiles = [];
        const backendFiles = [];
        
        // Find React/JS files
        const srcPath = path.join(__dirname, '..', 'src');
        if (fs.existsSync(srcPath)) {
            const findJSFiles = (dir) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    if (fs.statSync(filePath).isDirectory()) {
                        findJSFiles(filePath);
                    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
                        frontendFiles.push(filePath);
                    }
                });
            };
            findJSFiles(srcPath);
        }
        
        // Find PHP files
        const searchPaths = [
            path.join(__dirname, '..', 'api.php'),
            path.join(__dirname, '..', '..', 'deployable_files_step6', 'api.php')
        ];
        
        for (const searchPath of searchPaths) {
            if (fs.existsSync(searchPath)) {
                backendFiles.push(searchPath);
            }
        }
        
        let vulnerablePatterns = [];
        let protectedPatterns = [];
        
        // Check frontend files
        for (const file of frontendFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Dangerous patterns in React
            if (content.includes('dangerouslySetInnerHTML')) {
                vulnerablePatterns.push(`${file}: Uses dangerouslySetInnerHTML`);
            }
            
            // Check for proper escaping
            if (content.includes('DOMPurify') || content.includes('sanitize')) {
                protectedPatterns.push(`${file}: Uses sanitization`);
            }
        }
        
        // Check backend files
        for (const file of backendFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for output without escaping
            if (content.includes('echo $_') && !content.includes('htmlspecialchars')) {
                vulnerablePatterns.push(`${file}: Direct output without escaping`);
            }
            
            // Check for proper escaping
            if (content.includes('htmlspecialchars') || content.includes('filter_var')) {
                protectedPatterns.push(`${file}: Uses output escaping`);
            }
        }
        
        if (vulnerablePatterns.length > 0) {
            addResult(
                'XSS Protection',
                'failed',
                'high',
                `Found ${vulnerablePatterns.length} potential XSS vulnerabilities: ${vulnerablePatterns.join(', ')}`,
                'Always escape user input before output and avoid dangerouslySetInnerHTML'
            );
        } else if (protectedPatterns.length > 0) {
            addResult(
                'XSS Protection',
                'passed',
                'info',
                `Found ${protectedPatterns.length} files with XSS protection`,
                'Continue using proper output escaping'
            );
        } else {
            addResult(
                'XSS Protection',
                'warning',
                'medium',
                'No clear XSS protection patterns found',
                'Implement proper input validation and output escaping'
            );
        }
        
    } catch (error) {
        addResult(
            'XSS Protection',
            'error',
            'high',
            `Error during XSS test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function testAuthenticationSecurity() {
    log('Testing Authentication Security...');
    
    try {
        // Check for authentication-related files
        const authFiles = [];
        const searchPaths = [
            path.join(__dirname, '..', 'api', 'auth.php'),
            path.join(__dirname, '..', 'auth.php'),
            path.join(__dirname, '..', 'login.php'),
            path.join(__dirname, '..', 'src', 'pages', 'Login.jsx')
        ];
        
        for (const searchPath of searchPaths) {
            if (fs.existsSync(searchPath)) {
                authFiles.push(searchPath);
            }
        }
        
        let securityIssues = [];
        let securityFeatures = [];
        
        for (const file of authFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for password hashing
            if (file.endsWith('.php')) {
                if (content.includes('password_hash') || content.includes('password_verify')) {
                    securityFeatures.push(`${file}: Uses proper password hashing`);
                } else if (content.includes('md5') || content.includes('sha1')) {
                    securityIssues.push(`${file}: Uses weak password hashing`);
                }
                
                // Check for session security
                if (content.includes('session_regenerate_id')) {
                    securityFeatures.push(`${file}: Regenerates session ID`);
                }
                
                // Check for rate limiting
                if (content.includes('login_attempts') || content.includes('rate_limit')) {
                    securityFeatures.push(`${file}: Has rate limiting`);
                } else {
                    securityIssues.push(`${file}: No rate limiting detected`);
                }
            }
            
            // Check frontend authentication
            if (file.endsWith('.jsx')) {
                if (content.includes('localStorage') && content.includes('password')) {
                    securityIssues.push(`${file}: May store sensitive data in localStorage`);
                }
                
                if (content.includes('https') || content.includes('secure')) {
                    securityFeatures.push(`${file}: Uses secure communication`);
                }
            }
        }
        
        if (securityIssues.length > 0) {
            addResult(
                'Authentication Security',
                'failed',
                'high',
                `Found ${securityIssues.length} authentication security issues: ${securityIssues.join(', ')}`,
                'Implement proper password hashing, session management, and rate limiting'
            );
        } else if (securityFeatures.length > 0) {
            addResult(
                'Authentication Security',
                'passed',
                'info',
                `Found ${securityFeatures.length} security features: ${securityFeatures.join(', ')}`,
                'Continue following security best practices'
            );
        } else {
            addResult(
                'Authentication Security',
                'warning',
                'medium',
                'No authentication files found or analyzed',
                'Ensure authentication system follows security best practices'
            );
        }
        
    } catch (error) {
        addResult(
            'Authentication Security',
            'error',
            'high',
            `Error during authentication test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function testFileUploadSecurity() {
    log('Testing File Upload Security...');
    
    try {
        const uploadFiles = [];
        const searchPaths = [
            path.join(__dirname, '..', 'upload.php'),
            path.join(__dirname, '..', 'api', 'upload.php'),
            path.join(__dirname, '..', 'api.php')
        ];
        
        for (const searchPath of searchPaths) {
            if (fs.existsSync(searchPath)) {
                uploadFiles.push(searchPath);
            }
        }
        
        let vulnerabilities = [];
        let protections = [];
        
        for (const file of uploadFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for file upload handling
            if (content.includes('$_FILES') || content.includes('move_uploaded_file')) {
                // Check for file type validation
                if (content.includes('pathinfo') && content.includes('PATHINFO_EXTENSION')) {
                    protections.push(`${file}: Validates file extensions`);
                } else {
                    vulnerabilities.push(`${file}: No file type validation`);
                }
                
                // Check for file size validation
                if (content.includes('filesize') || content.includes('size')) {
                    protections.push(`${file}: Validates file size`);
                } else {
                    vulnerabilities.push(`${file}: No file size validation`);
                }
                
                // Check for dangerous file types
                if (content.includes('.php') || content.includes('.exe')) {
                    vulnerabilities.push(`${file}: May allow dangerous file types`);
                }
            }
        }
        
        if (vulnerabilities.length > 0) {
            addResult(
                'File Upload Security',
                'failed',
                'high',
                `Found ${vulnerabilities.length} file upload vulnerabilities: ${vulnerabilities.join(', ')}`,
                'Implement proper file type validation, size limits, and rename uploaded files'
            );
        } else if (protections.length > 0) {
            addResult(
                'File Upload Security',
                'passed',
                'info',
                `Found ${protections.length} file upload protections: ${protections.join(', ')}`,
                'Continue validating all uploaded files'
            );
        } else {
            addResult(
                'File Upload Security',
                'info',
                'low',
                'No file upload functionality detected',
                'If file uploads are added, ensure proper validation'
            );
        }
        
    } catch (error) {
        addResult(
            'File Upload Security',
            'error',
            'medium',
            `Error during file upload test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function testHTTPSAndHeaders() {
    log('Testing HTTPS and Security Headers...');
    
    try {
        // Check for HTTPS enforcement
        const configFiles = [
            path.join(__dirname, '..', '.htaccess'),
            path.join(__dirname, '..', 'config.php'),
            path.join(__dirname, '..', '..', 'deployable_files_step6', 'config.php')
        ];
        
        let httpsEnforced = false;
        let securityHeaders = [];
        let missingHeaders = [];
        
        for (const file of configFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for HTTPS enforcement
                if (content.includes('HTTPS') || content.includes('ssl') || content.includes('443')) {
                    httpsEnforced = true;
                }
                
                // Check for security headers
                SECURITY_CONFIG.requiredHeaders.forEach(header => {
                    if (content.includes(header)) {
                        securityHeaders.push(header);
                    } else {
                        missingHeaders.push(header);
                    }
                });
            }
        }
        
        // Check API files for headers
        const apiFiles = [
            path.join(__dirname, '..', 'api.php'),
            path.join(__dirname, '..', '..', 'deployable_files_step6', 'api.php')
        ];
        
        for (const file of apiFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                
                SECURITY_CONFIG.requiredHeaders.forEach(header => {
                    if (content.includes(header) && !securityHeaders.includes(header)) {
                        securityHeaders.push(header);
                        missingHeaders = missingHeaders.filter(h => h !== header);
                    }
                });
            }
        }
        
        if (!httpsEnforced) {
            addResult(
                'HTTPS Enforcement',
                'failed',
                'high',
                'HTTPS enforcement not detected',
                'Configure server to redirect HTTP to HTTPS and use HSTS headers'
            );
        } else {
            addResult(
                'HTTPS Enforcement',
                'passed',
                'info',
                'HTTPS enforcement detected',
                'Ensure all production traffic uses HTTPS'
            );
        }
        
        if (missingHeaders.length > 0) {
            addResult(
                'Security Headers',
                'failed',
                'medium',
                `Missing security headers: ${missingHeaders.join(', ')}`,
                'Add missing security headers to prevent common attacks'
            );
        }
        
        if (securityHeaders.length > 0) {
            addResult(
                'Security Headers',
                'passed',
                'info',
                `Found security headers: ${securityHeaders.join(', ')}`,
                'Continue using security headers'
            );
        }
        
    } catch (error) {
        addResult(
            'HTTPS and Headers',
            'error',
            'medium',
            `Error during HTTPS/headers test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function testDatabaseSecurity() {
    log('Testing Database Security...');
    
    try {
        const configFiles = [
            path.join(__dirname, '..', 'config.php'),
            path.join(__dirname, '..', '..', 'deployable_files_step6', 'config.php'),
            path.join(__dirname, '..', 'config_secure.php')
        ];
        
        let securityIssues = [];
        let securityFeatures = [];
        
        for (const file of configFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for hardcoded credentials
                if (content.includes('password') && (content.includes('123') || content.includes('admin') || content.includes('root'))) {
                    securityIssues.push(`${file}: Weak or default database credentials`);
                }
                
                // Check for environment variables
                if (content.includes('$_ENV') || content.includes('getenv')) {
                    securityFeatures.push(`${file}: Uses environment variables`);
                }
                
                // Check for SSL/TLS
                if (content.includes('ssl') || content.includes('tls')) {
                    securityFeatures.push(`${file}: Uses encrypted database connection`);
                }
                
                // Check for connection limits
                if (content.includes('timeout') || content.includes('limit')) {
                    securityFeatures.push(`${file}: Has connection limits`);
                }
            }
        }
        
        // Check database schema
        const dbFile = path.join(__dirname, '..', '..', 'upload', 'coprra_database_updated_step6_admin_features.sql');
        if (fs.existsSync(dbFile)) {
            const content = fs.readFileSync(dbFile, 'utf8');
            
            // Check for proper indexing on sensitive fields
            if (content.includes('INDEX') && content.includes('email')) {
                securityFeatures.push('Database: Has proper indexing');
            }
            
            // Check for constraints
            if (content.includes('FOREIGN KEY') || content.includes('CONSTRAINT')) {
                securityFeatures.push('Database: Uses foreign key constraints');
            }
        }
        
        if (securityIssues.length > 0) {
            addResult(
                'Database Security',
                'failed',
                'critical',
                `Found ${securityIssues.length} database security issues: ${securityIssues.join(', ')}`,
                'Use strong credentials, environment variables, and encrypted connections'
            );
        }
        
        if (securityFeatures.length > 0) {
            addResult(
                'Database Security',
                'passed',
                'info',
                `Found ${securityFeatures.length} security features: ${securityFeatures.join(', ')}`,
                'Continue following database security best practices'
            );
        }
        
    } catch (error) {
        addResult(
            'Database Security',
            'error',
            'high',
            `Error during database security test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function testSessionSecurity() {
    log('Testing Session Security...');
    
    try {
        const sessionFiles = [
            path.join(__dirname, '..', 'api', 'auth.php'),
            path.join(__dirname, '..', 'session.php'),
            path.join(__dirname, '..', 'api.php')
        ];
        
        let sessionIssues = [];
        let sessionFeatures = [];
        
        for (const file of sessionFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for session configuration
                if (content.includes('session_start')) {
                    // Check for secure session settings
                    if (content.includes('session.cookie_secure')) {
                        sessionFeatures.push(`${file}: Uses secure cookies`);
                    } else {
                        sessionIssues.push(`${file}: Cookies not marked as secure`);
                    }
                    
                    if (content.includes('session.cookie_httponly')) {
                        sessionFeatures.push(`${file}: Uses HttpOnly cookies`);
                    } else {
                        sessionIssues.push(`${file}: Cookies not marked as HttpOnly`);
                    }
                    
                    if (content.includes('session_regenerate_id')) {
                        sessionFeatures.push(`${file}: Regenerates session ID`);
                    } else {
                        sessionIssues.push(`${file}: No session ID regeneration`);
                    }
                }
            }
        }
        
        if (sessionIssues.length > 0) {
            addResult(
                'Session Security',
                'failed',
                'high',
                `Found ${sessionIssues.length} session security issues: ${sessionIssues.join(', ')}`,
                'Configure secure session settings and regenerate session IDs'
            );
        } else if (sessionFeatures.length > 0) {
            addResult(
                'Session Security',
                'passed',
                'info',
                `Found ${sessionFeatures.length} session security features: ${sessionFeatures.join(', ')}`,
                'Continue using secure session configuration'
            );
        } else {
            addResult(
                'Session Security',
                'warning',
                'medium',
                'No session handling detected',
                'If sessions are used, ensure proper security configuration'
            );
        }
        
    } catch (error) {
        addResult(
            'Session Security',
            'error',
            'medium',
            `Error during session security test: ${error.message}`,
            'Manual review required'
        );
    }
}

async function generateSecurityReport() {
    log('Generating Security Audit Report...');
    
    const critical = securityResults.filter(r => r.severity === 'critical').length;
    const high = securityResults.filter(r => r.severity === 'high').length;
    const medium = securityResults.filter(r => r.severity === 'medium').length;
    const low = securityResults.filter(r => r.severity === 'low').length;
    const info = securityResults.filter(r => r.severity === 'info').length;
    
    const passed = securityResults.filter(r => r.status === 'passed').length;
    const failed = securityResults.filter(r => r.status === 'failed').length;
    const warnings = securityResults.filter(r => r.status === 'warning').length;
    const errors = securityResults.filter(r => r.status === 'error').length;
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalTests: securityResults.length,
            passed,
            failed,
            warnings,
            errors,
            severityBreakdown: {
                critical,
                high,
                medium,
                low,
                info
            }
        },
        results: securityResults,
        recommendations: securityResults
            .filter(r => r.recommendation)
            .map(r => ({ test: r.testName, recommendation: r.recommendation }))
    };
    
    // Save JSON report
    const jsonPath = path.join(__dirname, 'security-audit-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    
    // Generate markdown report
    let markdown = `# Security Audit Report\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n\n`;
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Total Tests:** ${report.summary.totalTests}\n`;
    markdown += `- **Passed:** ${passed} ✅\n`;
    markdown += `- **Failed:** ${failed} ❌\n`;
    markdown += `- **Warnings:** ${warnings} ⚠️\n`;
    markdown += `- **Errors:** ${errors} 🔴\n\n`;
    
    markdown += `## Severity Breakdown\n\n`;
    markdown += `- **Critical:** ${critical} 🔴\n`;
    markdown += `- **High:** ${high} 🟠\n`;
    markdown += `- **Medium:** ${medium} 🟡\n`;
    markdown += `- **Low:** ${low} 🔵\n`;
    markdown += `- **Info:** ${info} ℹ️\n\n`;
    
    markdown += `## Detailed Results\n\n`;
    
    for (const result of securityResults) {
        const statusIcon = result.status === 'passed' ? '✅' : 
                          result.status === 'failed' ? '❌' : 
                          result.status === 'warning' ? '⚠️' : '🔴';
        
        const severityIcon = result.severity === 'critical' ? '🔴' : 
                            result.severity === 'high' ? '🟠' : 
                            result.severity === 'medium' ? '🟡' : 
                            result.severity === 'low' ? '🔵' : 'ℹ️';
        
        markdown += `### ${statusIcon} ${result.testName}\n\n`;
        markdown += `**Status:** ${result.status} | **Severity:** ${result.severity} ${severityIcon}\n\n`;
        markdown += `**Message:** ${result.message}\n\n`;
        if (result.recommendation) {
            markdown += `**Recommendation:** ${result.recommendation}\n\n`;
        }
    }
    
    if (report.recommendations.length > 0) {
        markdown += `## Priority Recommendations\n\n`;
        const criticalRecs = securityResults.filter(r => r.severity === 'critical' && r.recommendation);
        const highRecs = securityResults.filter(r => r.severity === 'high' && r.recommendation);
        
        if (criticalRecs.length > 0) {
            markdown += `### Critical Priority\n\n`;
            criticalRecs.forEach(rec => {
                markdown += `- **${rec.testName}:** ${rec.recommendation}\n`;
            });
            markdown += `\n`;
        }
        
        if (highRecs.length > 0) {
            markdown += `### High Priority\n\n`;
            highRecs.forEach(rec => {
                markdown += `- **${rec.testName}:** ${rec.recommendation}\n`;
            });
            markdown += `\n`;
        }
    }
    
    const markdownPath = path.join(__dirname, 'security-audit-report.md');
    fs.writeFileSync(markdownPath, markdown);
    
    log(`Security audit report generated: ${jsonPath}`, 'success');
    log(`Markdown report generated: ${markdownPath}`, 'success');
    
    return report;
}

// Main security audit runner
async function runSecurityAudit() {
    log('Starting Comprehensive Security Audit...');
    
    await testSQLInjectionProtection();
    await testXSSProtection();
    await testAuthenticationSecurity();
    await testFileUploadSecurity();
    await testHTTPSAndHeaders();
    await testDatabaseSecurity();
    await testSessionSecurity();
    
    const report = await generateSecurityReport();
    
    log('\n🔍 Security Audit Results Summary:');
    log(`Total Tests: ${report.summary.totalTests}`);
    log(`Passed: ${report.summary.passed}`);
    log(`Failed: ${report.summary.failed}`);
    log(`Warnings: ${report.summary.warnings}`);
    log(`Errors: ${report.summary.errors}`);
    
    log('\n📊 Severity Breakdown:');
    log(`Critical: ${report.summary.severityBreakdown.critical}`);
    log(`High: ${report.summary.severityBreakdown.high}`);
    log(`Medium: ${report.summary.severityBreakdown.medium}`);
    log(`Low: ${report.summary.severityBreakdown.low}`);
    
    if (report.summary.severityBreakdown.critical > 0) {
        log('\n🚨 CRITICAL SECURITY ISSUES FOUND - IMMEDIATE ACTION REQUIRED!', 'error');
    } else if (report.summary.severityBreakdown.high > 0) {
        log('\n⚠️ High severity issues found - should be addressed soon', 'warning');
    } else {
        log('\n✅ No critical security issues found', 'success');
    }
    
    log('\n🔒 Security Audit Complete!');
    
    return report;
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runSecurityAudit };
}

// Run audit if this file is executed directly
if (require.main === module) {
    runSecurityAudit().then(report => {
        const exitCode = report.summary.severityBreakdown.critical > 0 ? 2 : 
                        report.summary.severityBreakdown.high > 0 ? 1 : 0;
        process.exit(exitCode);
    }).catch(error => {
        log(`Security audit failed: ${error.message}`, 'error');
        process.exit(3);
    });
}

