// Validation utilities for forms and user input

/**
 * Validates Brazilian CPF format and checksum
 */
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return true; // Allow empty CPF
  
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Check length
  if (cleanCPF.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  
  if (firstDigit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;
  
  return secondDigit === parseInt(cleanCPF.charAt(10));
};

/**
 * Validates Brazilian phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Allow empty phone
  
  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Brazilian phone number (10 or 11 digits)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Formats CPF with dots and dash
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length <= 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
};

/**
 * Formats phone number with parentheses and dash
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

/**
 * Sanitizes text input by removing potentially harmful characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return input;
  
  // Remove script tags and basic XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Validates email format (more strict than HTML5)
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Allow empty email
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};