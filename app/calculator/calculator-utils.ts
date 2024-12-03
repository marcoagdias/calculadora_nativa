export function formatNumber(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  
  // Handle decimal places
  if (value.includes('.')) {
    return value;
  }
  
  return num.toString();
}

export function calculate(prev: number, current: number, operation: string): number {
  switch (operation) {
    case '+': return prev + current;
    case '-': return prev - current;
    case '×': return prev * current;
    case '÷': return current !== 0 ? prev / current : 0;
    case '%': return prev % current;
    case 'pow': return Math.pow(prev, current);
    default: return current;
  }
}

export function evaluateExpression(expression: string): number {
  // Replace × and ÷ with * and / for JavaScript evaluation
  const sanitizedExpression = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/');
  
  try {
    return Function(`'use strict'; return (${sanitizedExpression})`)();
  } catch (e) {
    return 0;
  }
}