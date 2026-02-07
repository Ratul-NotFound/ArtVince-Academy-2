/**
 * Security Validation Library
 * Provides input validation and sanitization functions to prevent XSS and injection attacks
 */

// ============================================
// STRING SANITIZATION
// ============================================

/**
 * Sanitize a string to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize string but allow basic formatting (for display purposes)
 */
export function sanitizeDisplayString(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============================================
// EMAIL VALIDATION
// ============================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
}

export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

const PHONE_REGEX = /^[0-9+\-\s()]{8,20}$/;

export function isValidPhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    return PHONE_REGEX.test(phone.trim());
}

export function sanitizePhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    // Remove all non-digit characters except + for international format
    return phone.replace(/[^\d+]/g, '');
}

// ============================================
// TRANSACTION ID VALIDATION
// ============================================

const TRANSACTION_ID_REGEX = /^[a-zA-Z0-9\-_]{4,50}$/;

export function isValidTransactionId(txId: string): boolean {
    if (!txId || typeof txId !== 'string') return false;
    return TRANSACTION_ID_REGEX.test(txId.trim());
}

export function sanitizeTransactionId(txId: string): string {
    if (!txId || typeof txId !== 'string') return '';
    // Only allow alphanumeric, hyphens, and underscores
    return txId.replace(/[^a-zA-Z0-9\-_]/g, '').trim();
}

// ============================================
// NAME VALIDATION
// ============================================

export function isValidDisplayName(name: string, maxLength: number = 100): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength;
}

export function sanitizeDisplayName(name: string): string {
    if (!name || typeof name !== 'string') return '';
    // Allow letters, numbers, spaces, and common name characters
    return name.replace(/[<>"/\\]/g, '').trim().slice(0, 100);
}

// ============================================
// MESSAGE CONTENT VALIDATION
// ============================================

export function isValidMessageContent(content: string, maxLength: number = 5000): boolean {
    if (!content || typeof content !== 'string') return false;
    const trimmed = content.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength;
}

export function sanitizeMessageContent(content: string): string {
    if (!content || typeof content !== 'string') return '';
    // Escape HTML but preserve whitespace
    return sanitizeDisplayString(content).slice(0, 5000);
}

// ============================================
// URL VALIDATION
// ============================================

export function isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

// ============================================
// VALIDATION RESULT TYPE
// ============================================

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    sanitizedValue?: string;
}

/**
 * Validate enrollment form data
 */
export function validateEnrollmentData(data: {
    studentName: string;
    transactionId: string;
    phoneNumber?: string;
}): ValidationResult {
    if (!isValidDisplayName(data.studentName)) {
        return { isValid: false, error: 'Invalid student name' };
    }

    if (!isValidTransactionId(data.transactionId)) {
        return { isValid: false, error: 'Invalid transaction ID format' };
    }

    if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
        return { isValid: false, error: 'Invalid phone number format' };
    }

    return {
        isValid: true,
        sanitizedValue: JSON.stringify({
            studentName: sanitizeDisplayName(data.studentName),
            transactionId: sanitizeTransactionId(data.transactionId),
            phoneNumber: data.phoneNumber ? sanitizePhoneNumber(data.phoneNumber) : undefined
        })
    };
}

/**
 * Validate login/registration form data
 */
export function validateAuthData(data: {
    email: string;
    displayName?: string;
}): ValidationResult {
    if (!isValidEmail(data.email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    if (data.displayName && !isValidDisplayName(data.displayName)) {
        return { isValid: false, error: 'Invalid display name' };
    }

    return { isValid: true };
}
