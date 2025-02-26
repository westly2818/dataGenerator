import { Component } from '@angular/core';
import * as moment from 'moment';

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
  dateValues: { [key: string]: any } = {};
  generatedData: any = []
  numOfEntries: any = 10
  copySuccess: boolean = false;
  invalidField: string | null = null;
  invalidFields: Set<string> = new Set();
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
        else if (this.dataTypes[key] === 'date') {
          // ✅ Ensure object initialization to avoid undefined errors
          this.dateValues[key] = Object.assign({}, this.dateValues[key], {
            startDate: moment().startOf('day').toDate(),
            endDate: moment().toDate(),
          });
          this.dateValues[key].startDate = moment().startOf('day').format('YYYY-MM-DD');
          this.dateValues[key].endDate = moment().format('YYYY-MM-DD');
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

    const isDate = (value: any): boolean => {
      if (!value || typeof value !== 'string') return false;

      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,  // "2025-01-23T06:17:34"
        /^\d{2}-\d{2}\d{4}$/,                     // "01-012025"
        /^\d{2}-\d{2}\d{4} \d{2}:\d{2}:\d{2}$/    // "01-012025 00:00:11"
      ];

      return datePatterns.some(pattern => pattern.test(value));
    };

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === 'object' && value !== null) {
          types[key] = value.$date ? 'Date' : 'Object';
        } else if (typeof value === 'string' && isDate(value)) {
          types[key] = 'date';
        } else {
          types[key] = typeof value;
        }
      }
    }

    return types;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  generateData() {
    this.invalidField = null;
    this.invalidFields.clear();
    let prepareObj: any = {}

    for (let ele in this.dataTypes) {
      prepareObj[ele] = {}
      if (this.dataTypes[ele] == 'string') {
        const defaultInput = this.stringRandomValues[ele];
        const customInput = this.customStringValues[ele]?.split(',').filter(val => val.trim() !== '');

        if (!defaultInput && (!customInput || customInput.length === 0)) {
          alert(`Error: String field "${ele}" must have either a default or custom input.`);
          this.invalidFields.add(ele); // Mark this field as invalid
          continue;
        }
        prepareObj[ele] = {
          "dataType": "string",
          "defaultInput": defaultInput,
          "customInput": customInput
        };
      }
      if (this.dataTypes[ele] == 'number') {
        const min = this.numberRange[ele]?.min;
        const max = this.numberRange[ele]?.max;

        // Validation: Min and Max should be valid numbers
        if (min === undefined || max === undefined || min > max) {
          alert(`Error: Number field "${ele}" must have a valid min and max range.`);
          this.invalidFields.add(ele); // Mark this field as invalid
          continue;
        }

        prepareObj[ele] = {
          "dataType": "number",
          "min": min,
          "max": max
        };
      }
      if (this.dataTypes[ele] == 'date') {
        const startDate = this.dateValues[ele]?.startDate;
        const endDate = this.dateValues[ele]?.endDate;

        // Validation: Start and End Dates must be provided
        if (!startDate || !endDate) {
          alert(`Error: Date field "${ele}" requires both Start Date and End Date.`);
          this.invalidFields.add(ele); // Mark this field as invalid
          continue;
        }

        prepareObj[ele] = {
          "dataType": "date",
          "startDate": startDate,
          "endDate": endDate
        };
      }
    }
    console.log(prepareObj);
    this.prepareDummyData(prepareObj)
    console.log('Generated Data:');
    console.log(this.dateValues);

    console.log('Data Types:', this.dataTypes);
    console.log('String Random Values:', this.stringRandomValues);
    console.log('Custom Inputs:', this.customStringValues);
    console.log('Number Ranges:', this.numberRange);
  }

  prepareDummyData(req: any) {
    const NoOfDataToGenerate = this.numOfEntries;
    const generateData = [];

    for (let i = 0; i < NoOfDataToGenerate; i++) {
      let temp: any = {};

      for (let key in req) {
        const field = req[key];

        if (field.dataType === 'string') {
          const randomDataArr = [...field.customInput]; // Avoid modifying original array

          // Generate unique random strings
          const generatedData = new Set();
          while (generatedData.size < field.defaultInput) {
            generatedData.add(key + '_' + this.getRandomString(5));
          }

          temp[key] = this.getRandomItem([...randomDataArr, ...generatedData]);
        }
        else if (field.dataType === 'number') {
          temp[key] = this.getRandomNumber(field.min, field.max);
        }
        else if (field.dataType === 'date') {
          temp[key] = this.formatTimestamp(this.getRandomTimestamp(field.startDate, field.endDate));
        }
      }

      generateData.push(temp);
    }
    this.generatedData = generateData
  }

  // Helper functions
  getRandomItem(arr: any) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getRandomString(length: any) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  getRandomTimestamp(startDate: any, endDate: any) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return new Date(start + Math.random() * (end - start));
  }

  getRandomNumber(min: any, max: any) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  formatTimestamp(date: any) {
    return date.toISOString().replace('T', ' ').split('.')[0]; // Format: "YYYY-MM-DD HH:mm:ss"
  }

  onDataTypeChange(key: string) {
    if (this.dataTypes[key] === 'date' && !this.dateValues[key]) {
      this.dateValues[key] = { startDate: '', endDate: '' }; // Initialize date field
    }
  }
  copyToClipboard(): void {
    const jsonString = JSON.stringify(this.generatedData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    });
  }
}
