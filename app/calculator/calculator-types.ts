export interface CalculatorButton {
  value: string;
  operation?: string;
}

export type CalculatorOperation = '+' | '-' | '×' | '÷' | '%' | 'pow' | '(' | ')';

export interface CalculatorState {
  display: string;
  expression: string;
  currentNumber: string;
  hasParentheses: boolean;
  openParentheses: number;
}