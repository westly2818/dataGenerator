import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dataGenerator';
  jsonInput: string = '';
  formattedJson: string | null = null;
  dataTypes: { [key: string]: string } = {};
  dropdownOptions = ['string', 'number', 'date'];
  customStringValues: { [key: string]: string } = {};
  stringRandomValues: { [key: string]: number } = {};
  numberRange: { [key: string]: { min: number; max: number } } = {};

  processJson() {
    try {
      this.formattedJson = JSON.parse(this.jsonInput);
      this.dataTypes = this.getDataTypes(this.formattedJson);

      for (const key of Object.keys(this.dataTypes)) {
        if (this.dataTypes[key] === 'string') {
          this.stringRandomValues[key] = 3;
          this.customStringValues[key] = '';
        } else if (this.dataTypes[key] === 'number') {
          // ✅ Ensure object initialization to avoid undefined errors
          if (!this.numberRange[key]) {
            this.numberRange[key] = { min: 10, max: 100 };
          }
        }
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
      this.dataTypes = {};
      this.stringRandomValues = {};
      this.customStringValues = {};
      this.numberRange = {};
    }
  }

  getDataTypes(obj: any): { [key: string]: string } {
    let types: { [key: string]: string } = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          types[key] = obj[key].$date ? 'Date' : 'Object';
        } else {
          types[key] = typeof obj[key];
        }
      }
    }

    return types;
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  generateData() {
    console.log('Generated Data:');
    console.log('Data Types:', this.dataTypes);
    console.log('String Random Values:', this.stringRandomValues);
    console.log('Custom Inputs:', this.customStringValues);
    console.log('Number Ranges:', this.numberRange);
  }
}
