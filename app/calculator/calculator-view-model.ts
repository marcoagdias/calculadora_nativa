import { Observable } from '@nativescript/core';
import { CalculatorOperation, CalculatorState } from './calculator-types';
import { evaluateExpression } from './calculator-utils';

export class CalculatorViewModel extends Observable {
  private state: CalculatorState = {
    display: '0',
    expression: '',
    currentNumber: '',
    hasParentheses: false,
    openParentheses: 0
  };

  constructor() {
    super();
  }

  get display(): string {
    return this.state.display;
  }

  get expression(): string {
    return this.state.expression;
  }

  onNumberTap(args: any) {
    const value = args.object.text;
    
    if (this.state.currentNumber === '0' && value === '0') {
      return;
    }

    if (this.state.currentNumber === '0') {
      this.state.currentNumber = value;
    } else {
      this.state.currentNumber += value;
    }

    this.updateDisplay();
  }

  onOperationTap(args: any) {
    const operation = args.object.text as CalculatorOperation;
    
    switch (operation) {
      case '(':
        this.handleOpenParenthesis();
        break;
      case ')':
        this.handleCloseParenthesis();
        break;
      default:
        this.handleOperation(operation);
    }

    this.updateDisplay();
  }

  onClear() {
    this.state = {
      display: '0',
      expression: '',
      currentNumber: '',
      hasParentheses: false,
      openParentheses: 0
    };
    this.notifyPropertyChange('display', '0');
    this.notifyPropertyChange('expression', '');
  }

  onBackspace() {
    if (this.state.currentNumber.length > 0) {
      this.state.currentNumber = this.state.currentNumber.slice(0, -1);
      if (this.state.currentNumber === '') {
        this.state.currentNumber = '0';
      }
    } else if (this.state.expression.length > 0) {
      const lastChar = this.state.expression.slice(-1);
      if (lastChar === '(') {
        this.state.openParentheses--;
      } else if (lastChar === ')') {
        this.state.openParentheses++;
      }
      this.state.expression = this.state.expression.slice(0, -1);
    }
    this.updateDisplay();
  }

  onEquals() {
    if (this.state.currentNumber) {
      this.state.expression += this.state.currentNumber;
    }
    
    // Close any remaining open parentheses
    while (this.state.openParentheses > 0) {
      this.state.expression += ')';
      this.state.openParentheses--;
    }

    const result = evaluateExpression(this.state.expression);
    this.state.expression = result.toString();
    this.state.currentNumber = '';
    this.state.hasParentheses = false;
    this.state.openParentheses = 0;
    this.updateDisplay();
  }

  private handleOpenParenthesis() {
    if (this.state.currentNumber) {
      this.state.expression += this.state.currentNumber + '×(';
      this.state.currentNumber = '';
    } else {
      this.state.expression += '(';
    }
    this.state.openParentheses++;
    this.state.hasParentheses = true;
  }

  private handleCloseParenthesis() {
    if (this.state.openParentheses > 0) {
      if (this.state.currentNumber) {
        this.state.expression += this.state.currentNumber + ')';
        this.state.currentNumber = '';
      } else {
        this.state.expression += ')';
      }
      this.state.openParentheses--;
    }
  }

  private handleOperation(operation: CalculatorOperation) {
    if (this.state.currentNumber) {
      this.state.expression += this.state.currentNumber + operation;
      this.state.currentNumber = '';
    } else if (this.state.expression) {
      // Replace last operation if it exists
      if (['+', '-', '×', '÷', '%'].includes(this.state.expression.slice(-1))) {
        this.state.expression = this.state.expression.slice(0, -1) + operation;
      } else {
        this.state.expression += operation;
      }
    }
  }

  private updateDisplay() {
    const displayExpression = this.state.expression + this.state.currentNumber;
    this.notifyPropertyChange('display', this.state.currentNumber || '0');
    this.notifyPropertyChange('expression', displayExpression);
  }
}