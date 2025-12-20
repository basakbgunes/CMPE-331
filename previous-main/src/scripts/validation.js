/**
 * Validation and Alert System for Flight Roster
 * Handles frontend validation, alert display, and user feedback
 */

class AlertManager {
    constructor(containerId = 'alerts-container') {
        this.container = document.getElementById(containerId);
        this.alerts = [];
        
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.className = 'alerts-container';
            document.body.insertBefore(this.container, document.body.firstChild);
        }
    }
    
    /**
     * Add an alert/warning to display
     * @param {Object} alert - Alert object from backend or local validation
     * @param {string} alert.code - Alert code (e.g., "PAX-001")
     * @param {string} alert.message - Alert message (can be Turkish or English)
     * @param {string} alert.level - "error" | "warning" | "info" | "success"
     * @param {string} alert.entityType - "passenger" | "crew" | "roster" | etc
     * @param {string} [alert.entityId] - ID of affected entity
     * @param {string} [alert.suggestion] - Suggested fix
     */
    addAlert(alert) {
        // Prevent duplicate alerts
        const isDuplicate = this.alerts.some(a => 
            a.code === alert.code && a.entityId === alert.entityId
        );
        
        if (isDuplicate) return;
        
        this.alerts.push(alert);
        this.renderAlert(alert);
    }
    
    /**
     * Clear all alerts
     */
    clearAlerts() {
        this.alerts = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    /**
     * Remove a specific alert
     */
    removeAlert(code, entityId = null) {
        this.alerts = this.alerts.filter(a => 
            !(a.code === code && (!entityId || a.entityId === entityId))
        );
        this.render();
    }
    
    /**
     * Render a single alert to the DOM
     */
    renderAlert(alert) {
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${alert.level}`;
        alertEl.dataset.code = alert.code;
        if (alert.entityId) {
            alertEl.dataset.entityId = alert.entityId;
        }
        
        let html = `
            <div class="alert-header">
                <span class="alert-icon">
                    ${this.getAlertIcon(alert.level)}
                </span>
                <span class="alert-code">${alert.code}</span>
                <span class="alert-message">${this.escapeHtml(alert.message)}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        if (alert.entityId) {
            html += `<div class="alert-detail">Etkilenen: <strong>${this.escapeHtml(alert.entityId)}</strong></div>`;
        }
        
        if (alert.suggestion) {
            html += `<div class="alert-suggestion">💡 ${this.escapeHtml(alert.suggestion)}</div>`;
        }
        
        alertEl.innerHTML = html;
        this.container.appendChild(alertEl);
        
        // Auto-remove info alerts after 5 seconds
        if (alert.level === 'info') {
            setTimeout(() => alertEl.remove(), 5000);
        }
    }
    
    /**
     * Render all alerts
     */
    render() {
        this.container.innerHTML = '';
        this.alerts.forEach(alert => this.renderAlert(alert));
    }
    
    /**
     * Get icon for alert level
     */
    getAlertIcon(level) {
        const icons = {
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'success': '✅'
        };
        return icons[level] || '•';
    }
    
    /**
     * Get alerts by level
     */
    getAlertsByLevel(level) {
        return this.alerts.filter(a => a.level === level);
    }
    
    /**
     * Check if there are critical errors
     */
    hasErrors() {
        return this.getAlertsByLevel('error').length > 0;
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Summary of all alerts
     */
    getSummary() {
        return {
            total: this.alerts.length,
            errors: this.getAlertsByLevel('error').length,
            warnings: this.getAlertsByLevel('warning').length,
            info: this.getAlertsByLevel('info').length
        };
    }
}

/**
 * Form Validator - Real-time form validation
 */
class FormValidator {
    constructor() {
        this.rules = {};
        this.errors = {};
    }
    
    /**
     * Define validation rules for fields
     * @param {string} fieldName 
     * @param {Array} rules - Array of rule objects with {validate, message}
     */
    addFieldRules(fieldName, rules) {
        this.rules[fieldName] = rules;
        this.errors[fieldName] = [];
    }
    
    /**
     * Validate single field
     */
    validateField(fieldName, value) {
        this.errors[fieldName] = [];
        
        const fieldRules = this.rules[fieldName] || [];
        for (const rule of fieldRules) {
            if (!rule.validate(value)) {
                this.errors[fieldName].push(rule.message);
            }
        }
        
        return this.errors[fieldName].length === 0;
    }
    
    /**
     * Validate entire form
     */
    validateForm(formData) {
        let isValid = true;
        
        for (const fieldName in this.rules) {
            if (!this.validateField(fieldName, formData[fieldName])) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    /**
     * Get field errors
     */
    getFieldErrors(fieldName) {
        return this.errors[fieldName] || [];
    }
}

/**
 * Passenger Input Validator - Specific validation rules for passenger data
 */
class PassengerValidator {
    static validatePaxId(paxId) {
        return paxId && paxId.trim().length > 0;
    }
    
    static validateFullName(name) {
        return name && name.trim().length >= 2;
    }
    
    static validateAge(age) {
        try {
            const ageNum = parseInt(age);
            return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 150;
        } catch {
            return false;
        }
    }
    
    static validateType(type) {
        const validTypes = ['adult', 'child', 'infant'];
        return validTypes.includes(type.toLowerCase());
    }
    
    static validateSeat(seat, assigned = true) {
        if (!assigned) return true; // Seat not required
        return seat && seat.trim().length > 0 && /^[A-Z]\d+$/.test(seat.trim());
    }
    
    /**
     * Validate complete passenger object
     */
    static validatePassenger(passenger) {
        const alerts = [];
        
        if (!this.validatePaxId(passenger.paxId)) {
            alerts.push({
                code: 'PAX-001',
                level: 'error',
                message: 'Yolcu ID boş olamaz'
            });
        }
        
        if (!this.validateFullName(passenger.fullName)) {
            alerts.push({
                code: 'PAX-002',
                level: 'error',
                message: 'Yolcu adı en az 2 karakter olmalı'
            });
        }
        
        if (!this.validateAge(passenger.age)) {
            alerts.push({
                code: 'PAX-003',
                level: 'error',
                message: 'Yaş 0-150 arasında olmalı'
            });
        }
        
        if (!this.validateType(passenger.type)) {
            alerts.push({
                code: 'PAX-008',
                level: 'error',
                message: 'Geçersiz yolcu tipi'
            });
        }
        
        return alerts;
    }
}

/**
 * API Validator - Sends data to backend for validation
 */
class APIValidator {
    constructor(baseUrl = 'http://localhost:5004') {
        this.baseUrl = baseUrl;
        this.apiEndpoints = {
            validatePassenger: `${baseUrl}/api/validate/passenger`,
            validateRoster: `${baseUrl}/api/validate/roster`,
            health: `${baseUrl}/api/validate/health`
        };
    }
    
    /**
     * Validate passenger via API
     */
    async validatePassenger(passengerData) {
        try {
            const response = await fetch(this.apiEndpoints.validatePassenger, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passengerData)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Validation API error:', error);
            return {
                isValid: false,
                alerts: [{
                    code: 'API-ERROR',
                    level: 'error',
                    message: `Doğrulama servisi hatası: ${error.message}`
                }]
            };
        }
    }
    
    /**
     * Validate complete roster via API
     */
    async validateRoster(rosterData) {
        try {
            const response = await fetch(this.apiEndpoints.validateRoster, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rosterData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Roster validation error:', error);
            return {
                isValid: false,
                alerts: [{
                    code: 'API-ERROR',
                    level: 'error',
                    message: `Roster doğrulama hatası: ${error.message}`
                }]
            };
        }
    }
    
    /**
     * Check if validation service is available
     */
    async checkHealth() {
        try {
            const response = await fetch(this.apiEndpoints.health);
            return response.ok;
        } catch {
            return false;
        }
    }
}

/**
 * Inline Field Validator - Show validation errors inline in forms
 */
class InlineValidator {
    constructor() {
        this.validationMap = new Map();
    }
    
    /**
     * Setup validation for a form field
     */
    setupFieldValidation(fieldId, validatorFn, errorContainerId) {
        const field = document.getElementById(fieldId);
        const errorContainer = document.getElementById(errorContainerId);
        
        if (!field) return;
        
        // Real-time validation on input
        field.addEventListener('input', () => {
            this.validateField(field, validatorFn, errorContainer);
        });
        
        // Validation on blur
        field.addEventListener('blur', () => {
            this.validateField(field, validatorFn, errorContainer);
        });
    }
    
    /**
     * Validate a single field
     */
    validateField(field, validatorFn, errorContainer) {
        const isValid = validatorFn(field.value);
        
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            if (errorContainer) {
                errorContainer.innerHTML = '';
                errorContainer.style.display = 'none';
            }
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            if (errorContainer) {
                errorContainer.style.display = 'block';
                errorContainer.classList.add('error-message');
            }
        }
        
        return isValid;
    }
}

// Global instances
window.alertManager = new AlertManager();
window.apiValidator = new APIValidator();

console.log('✅ Validation and Alert System loaded');
