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
  dateValues: { [key: string]: any } = {};
  generatedData: any = []
  numOfEntries: any = 10
  copySuccess: boolean = false;
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

    let obj = {
      "name": {
        "dataType": "string", "customInput": 5, "clientInput": ['david', 'latchu']
      },
      "tag_name": {
        "dataType": "string", "customInput": 2, "clientInput": ["SPR_22", "Vibsum", "Fke_2"]
      },
      "timestamp": {
        "dataType": "timestamp", "startDate": "2025-02-18 00:00:00", "endDate": "2025-02-18 00:10:00"
      },
      "tag_value": {
        "dataType": "number", "min": 5, "max": 20
      },
    };

    let prepareObj: any = {}

    for (let ele in this.dataTypes) {
      prepareObj[ele] = {}
      if (this.dataTypes[ele] == 'string') {
        prepareObj[ele] = {
          "dataType": "string", "defaultInput": this.stringRandomValues[ele], "customInput": this.customStringValues[ele].split(',').filter(val => val.trim() !== '')
        }
      }
      if (this.dataTypes[ele] == 'number') {
        prepareObj[ele] = {
          "dataType": "number", "min": this.numberRange[ele].min, "max": this.numberRange[ele].max
        }
      }
      if (this.dataTypes[ele] == 'date') {
        prepareObj[ele] = {
          "dataType": "date", "startDate": this.dateValues[ele].startDate, "endDate": this.dateValues[ele].endDate
        }
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
