/**
 * HealthCare AI - Main JavaScript Functions
 * Handles common functionality across the application
 */

// Global variables
let currentUser = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkUserSession();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Add fade-in animation to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Auto-dismiss alerts after 5 seconds
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (alert.classList.contains('alert-success') || alert.classList.contains('alert-info')) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        });
    }, 5000);
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Loading states for buttons
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            // Only show loading if form is valid
            if (form.checkValidity()) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                }
            }
        });
    });
    
    // Confirmation dialogs for destructive actions
    document.querySelectorAll('[data-confirm]').forEach(element => {
        element.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Check user session and update UI accordingly
 */
function checkUserSession() {
    // This would typically check with the server
    // For now, we'll just check if we're on a protected page
    const protectedPages = ['/dashboard', '/lifestyle_log', '/health_tips', '/alerts', '/chatbot'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        // User is on a protected page, assume they're logged in
        currentUser = {
            loggedIn: true
        };
    }
}

/**
 * Format date for display
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    const formatOptions = { ...defaultOptions, ...options };
    
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format time for display
 */
function formatTime(date, options = {}) {
    const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };
    const formatOptions = { ...defaultOptions, ...options };
    
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    return date.toLocaleTimeString('en-US', formatOptions);
}

/**
 * Show loading spinner
 */
function showLoading(element) {
    if (element) {
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        element.disabled = true;
    }
}

/**
 * Hide loading spinner
 */
function hideLoading(element, originalText = 'Submit') {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

/**
 * Validate form data
 */
function validateForm(formData, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData.get(field);
        
        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${rule.label || field} is required`);
            continue;
        }
        
        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
        }
        
        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.label || field} must be no more than ${rule.maxLength} characters`);
        }
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.label || field} format is invalid`);
        }
        
        if (value && rule.min && parseFloat(value) < rule.min) {
            errors.push(`${rule.label || field} must be at least ${rule.min}`);
        }
        
        if (value && rule.max && parseFloat(value) > rule.max) {
            errors.push(`${rule.label || field} must be no more than ${rule.max}`);
        }
    }
    
    return errors;
}

/**
 * Display form validation errors
 */
function displayFormErrors(errors, formElement) {
    // Remove existing error messages
    const existingErrors = formElement.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    if (errors.length > 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger error-message';
        errorDiv.innerHTML = `
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Please correct the following errors:</h6>
            <ul class="mb-0">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        
        formElement.insertBefore(errorDiv, formElement.firstChild);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Handle API errors
 */
function handleApiError(error) {
    console.error('API Error:', error);
    
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
        // Server responded with error status
        message = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
        // Request made but no response received
        message = 'Unable to connect to server. Please check your internet connection.';
    }
    
    showNotification(message, 'danger');
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Local storage helpers
 */
const Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

/**
 * Health data utilities
 */
const HealthUtils = {
    /**
     * Calculate BMI
     */
    calculateBMI: function(weight, height) {
        if (!weight || !height || weight <= 0 || height <= 0) {
            return null;
        }
        
        // Convert height from cm to meters if needed
        if (height > 3) {
            height = height / 100;
        }
        
        const bmi = weight / (height * height);
        return Math.round(bmi * 10) / 10;
    },
    
    /**
     * Get BMI category
     */
    getBMICategory: function(bmi) {
        if (!bmi) return 'Unknown';
        
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    },
    
    /**
     * Calculate daily water intake recommendation
     */
    getWaterRecommendation: function(weight, activityLevel = 'moderate') {
        if (!weight || weight <= 0) return 8; // Default 8 glasses
        
        let baseAmount = weight * 0.033; // 33ml per kg body weight in liters
        
        // Adjust for activity level
        const multipliers = {
            low: 1,
            moderate: 1.2,
            high: 1.5
        };
        
        baseAmount *= multipliers[activityLevel] || 1.2;
        
        // Convert to glasses (assuming 250ml per glass)
        return Math.round(baseAmount * 4);
    },
    
    /**
     * Validate health metrics
     */
    validateHealthMetrics: function(metrics) {
        const errors = [];
        
        if (metrics.sleepHours && (metrics.sleepHours < 0 || metrics.sleepHours > 24)) {
            errors.push('Sleep hours must be between 0 and 24');
        }
        
        if (metrics.exerciseMinutes && (metrics.exerciseMinutes < 0 || metrics.exerciseMinutes > 1440)) {
            errors.push('Exercise minutes must be between 0 and 1440');
        }
        
        if (metrics.waterGlasses && (metrics.waterGlasses < 0 || metrics.waterGlasses > 50)) {
            errors.push('Water glasses must be between 0 and 50');
        }
        
        return errors;
    }
};

// Export functions for use in other scripts
window.HealthCareAI = {
    formatDate,
    formatTime,
    showLoading,
    hideLoading,
    showNotification,
    validateForm,
    displayFormErrors,
    handleApiError,
    debounce,
    Storage,
    HealthUtils
};
