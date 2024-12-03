import { EventData, Page } from '@nativescript/core';
import { CalculatorViewModel } from './calculator-view-model';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new CalculatorViewModel();
}