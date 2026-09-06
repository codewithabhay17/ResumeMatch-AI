# 🔒 Input Validation & Security Documentation

## Overview
Complete input validation and sanitization system for the AI-Powered Resume Analyzer to prevent security vulnerabilities (XSS, SQL Injection, etc.)

---

## Frontend Validation (`frontend/src/utils/validation.js`)

### Email Validation
```javascript
import { validateEmail } from '../utils/validation';

const result = validateEmail('user@example.com');
// Returns: { valid: true, value: 'user@example.com' }

const result = validateEmail('invalid-email');
// Returns: { valid: false, error: 'Invalid email format' }
```

**Validation Rules:**
- ✅ Required field
- ✅ Valid email format (RFC 5322 simplified)
- ✅ Maximum 254 characters
- ✅ Converted to lowercase

---

### Password Validation
```javascript
import { validatePassword } from '../utils/validation';

const result = validatePassword('SecurePass123');
// Returns: { valid: true }

const result = validatePassword('short');
// Returns: { valid: false, error: 'Password must be at least 6 characters' }
```

**Validation Rules:**
- ✅ Required field
- ✅ Minimum 6 characters
- ✅ Maximum 128 characters

---

### Name Validation
```javascript
import { validateName } from '../utils/validation';

const result = validateName('John Doe');
// Returns: { valid: true, value: 'John Doe' }

const result = validateName('J');
// Returns: { valid: false, error: 'Name must be at least 2 characters' }
```

**Validation Rules:**
- ✅ Required field
- ✅ Minimum 2 characters
- ✅ Maximum 100 characters
- ✅ Only alphanumeric, spaces, hyphens, apostrophes
- ✅ Trimmed of whitespace

---

### Password Match Validation
```javascript
import { validatePasswordMatch } from '../utils/validation';

const result = validatePasswordMatch('password123', 'password123');
// Returns: { valid: true }

const result = validatePasswordMatch('password123', 'password456');
// Returns: { valid: false, error: 'Passwords do not match' }
```

---

### File Upload Validation
```javascript
import { validateFile } from '../utils/validation';

const result = validateFile(fileInput, 5242880); // 5MB max
// Returns: { valid: true } or { valid: false, error: '...' }
```

**Validation Rules:**
- ✅ Required file
- ✅ Maximum 5MB file size (configurable)
- ✅ Only PDF and TXT files allowed
- ✅ File type verification

---

### Input Sanitization (XSS Prevention)
```javascript
import { sanitizeInput } from '../utils/validation';

const input = '<script>alert("XSS")</script>';
const sanitized = sanitizeInput(input);
// Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
```

**Sanitization Rules:**
- ✅ Escapes HTML special characters
- ✅ Prevents XSS attacks
- ✅ Maintains readability

---

### Search Query Validation
```javascript
import { validateSearchQuery } from '../utils/validation';

const result = validateSearchQuery('React Developer');
// Returns: { valid: true, value: 'React Developer' }

const result = validateSearchQuery('a');
// Returns: { valid: false, error: 'Search query must be at least 2 characters' }
```

**Validation Rules:**
- ✅ Required field
- ✅ Minimum 2 characters
- ✅ Maximum 100 characters

---

### Pagination Validation
```javascript
import { validatePagination } from '../utils/validation';

const result = validatePagination(20, 0);
// Returns: { limit: 20, offset: 0 }

const result = validatePagination(500, -10);
// Returns: { limit: 20, offset: 0 } // Auto-corrected
```

**Validation Rules:**
- ✅ Limit: 1-100 (default: 20)
- ✅ Offset: ≥ 0 (default: 0)
- ✅ Auto-corrects invalid values

---

## Backend Validation (`backend/src/utils/validation.js`)

### Backend Input Validation Functions

#### Register Input Validation
```javascript
const { validateRegisterInput } = require('../utils/validation');

const result = validateRegisterInput(email, name, password, confirmPassword);
// Returns: { isValid: true, errors: [] } or { isValid: false, errors: ['...'] }
```

**Checks:**
- ✅ Valid email format
- ✅ Name 2-100 characters
- ✅ Password 6-128 characters
- ✅ Passwords match

---

#### Login Input Validation
```javascript
const { validateLoginInput } = require('../utils/validation');

const result = validateLoginInput(email, password);
// Returns: { isValid: true, errors: [] } or { isValid: false, errors: ['...'] }
```

---

### Backend Sanitization
```javascript
const { sanitizeString } = require('../utils/validation');

const dirty = '<img src=x onerror="alert(1)">';
const clean = sanitizeString(dirty);
// Returns: '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
```

---

## Middleware Integration

### Global Sanitization Middleware
Automatically applied to all routes in `server.js`:

```javascript
// In backend/src/server.js
const { sanitizeRequestData } = require('./utils/validation');
app.use(sanitizeRequestData);
```

**Applied to:**
- All POST requests
- All PUT/PATCH requests
- Query parameters
- Request body fields

---

### Route-Level Validation
Applied to specific routes:

```javascript
// In backend/src/routes/auth.routes.js
const { validateRequestBody } = require('../utils/validation');

router.post('/register', validateRequestBody, registerController);
router.post('/login', validateRequestBody, loginController);
```

---

## Frontend Implementation Examples

### Login Component with Validation
```javascript
import { validateEmail, validatePassword } from '../utils/validation';

const handleLogin = async (e) => {
  e.preventDefault();

  // Validate email
  const emailVal = validateEmail(email);
  if (!emailVal.valid) {
    setError(emailVal.error);
    return;
  }

  // Validate password
  const passVal = validatePassword(password);
  if (!passVal.valid) {
    setError(passVal.error);
    return;
  }

  // Proceed with login
  try {
    await login(emailVal.value, password);
  } catch (err) {
    setError(err.message);
  }
};
```

---

### Register Component with Validation
```javascript
import { 
  validateEmail, 
  validateName, 
  validatePassword, 
  validatePasswordMatch 
} from '../utils/validation';

const handleRegister = async (e) => {
  e.preventDefault();

  // Validate all fields
  const nameVal = validateName(name);
  if (!nameVal.valid) {
    setError(nameVal.error);
    return;
  }

  const emailVal = validateEmail(email);
  if (!emailVal.valid) {
    setError(emailVal.error);
    return;
  }

  const passVal = validatePassword(password);
  if (!passVal.valid) {
    setError(passVal.error);
    return;
  }

  const matchVal = validatePasswordMatch(password, confirmPassword);
  if (!matchVal.valid) {
    setError(matchVal.error);
    return;
  }

  // Proceed with registration
  try {
    await register(nameVal.value, emailVal.value, password);
  } catch (err) {
    setError(err.message);
  }
};
```

---

## Security Features

### ✅ XSS (Cross-Site Scripting) Prevention
- All user inputs are sanitized
- HTML special characters are escaped
- Script tags and event handlers are neutralized

### ✅ Email Validation
- RFC 5322 compliant validation
- Prevents invalid email registrations
- Case-normalized (lowercase)

### ✅ Password Security
- Minimum length requirement (6 characters)
- Maximum length check (128 characters)
- Server-side hashing with bcrypt

### ✅ SQL Injection Prevention
- Input sanitization on all fields
- Database parameters use prepared statements
- Prisma ORM provides automatic protection

### ✅ File Upload Security
- MIME type validation (PDF, TXT only)
- File size restrictions (5MB max)
- Filename sanitization
- Uploaded to secure directory

### ✅ Input Rate Limiting
- Pagination limits prevent data enumeration
- Query validation prevents abuse

---

## Testing Validation

### Frontend Test Cases
```javascript
// Valid inputs
validateEmail('user@example.com') // ✅
validatePassword('secure123') // ✅
validateName('John Doe') // ✅

// Invalid inputs
validateEmail('invalid-email') // ❌
validatePassword('short') // ❌
validateName('A') // ❌
validateName('<script>alert()</script>') // ❌
```

### Backend Test Cases
```javascript
// Valid registration
validateRegisterInput('user@example.com', 'John', 'password123', 'password123')
// ✅ { isValid: true, errors: [] }

// Invalid email
validateRegisterInput('invalid', 'John', 'password123', 'password123')
// ❌ { isValid: false, errors: ['Invalid email format'] }

// Password mismatch
validateRegisterInput('user@example.com', 'John', 'password123', 'password456')
// ❌ { isValid: false, errors: ['Passwords do not match'] }
```

---

## Best Practices

### For Frontend Development
1. ✅ Always import validation utilities
2. ✅ Validate BEFORE sending to API
3. ✅ Show user-friendly error messages
4. ✅ Sanitize before display
5. ✅ Use validation in all forms

### For Backend Development
1. ✅ Never trust frontend validation
2. ✅ Always validate on backend
3. ✅ Sanitize all inputs
4. ✅ Use prepared statements
5. ✅ Log validation failures

---

## Future Enhancements

### Planned Validations
- [ ] Phone number validation
- [ ] URL validation
- [ ] Rate limiting middleware
- [ ] CAPTCHA integration
- [ ] Two-factor authentication
- [ ] Email verification
- [ ] Password strength meter
- [ ] Brute-force protection

---

## API Reference

### Frontend Functions
| Function | Params | Returns |
|----------|--------|---------|
| `validateEmail()` | email | { valid: bool, value?: string, error?: string } |
| `validatePassword()` | password | { valid: bool, error?: string } |
| `validateName()` | name | { valid: bool, value?: string, error?: string } |
| `validatePasswordMatch()` | password, confirmPassword | { valid: bool, error?: string } |
| `validateFile()` | file, maxSize | { valid: bool, error?: string } |
| `sanitizeInput()` | input | string |
| `validateSearchQuery()` | query | { valid: bool, value?: string, error?: string } |
| `validatePagination()` | limit, offset | { limit: number, offset: number } |

### Backend Functions
| Function | Params | Returns |
|----------|--------|---------|
| `isValidEmail()` | email | boolean |
| `validateRegisterInput()` | email, name, password, confirmPassword | { isValid: bool, errors: [] } |
| `validateLoginInput()` | email, password | { isValid: bool, errors: [] } |
| `sanitizeString()` | input | string |
| `validatePagination()` | limit, offset | { limit: number, offset: number } |
| `validateSearchQuery()` | query | { isValid: bool, errors: [] } |
| `validateRequestBody()` | middleware | next() |
| `sanitizeRequestData()` | middleware | next() |

---

**Last Updated:** 2026-09-04
**Status:** ✅ Production Ready
