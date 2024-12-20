import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as Papa from 'papaparse';
import { CommonModule } from '@angular/common'; 
import{MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgModule } from '@angular/core';
import { DxChartModule } from 'devextreme-angular';
import { Chart, registerables } from 'chart.js'; 
import { FormsModule} from '@angular/forms';
import { GraphDataService } from './graph-data.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { DxButtonModule } from 'devextreme-angular';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,  CommonModule,          
  MatButtonModule,       
  MatIconModule,        
  MatFormFieldModule,    
  MatInputModule,FormsModule,DxChartModule,HttpClientModule,DxButtonModule],
  providers: [GraphDataService,HttpClient],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private graphService : GraphDataService){

  }
  ngOnInit(): void {
  
  }
  @ViewChildren('graphCanvas') graphCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  title = 'batteryTestBench';
  selectedFileNames: string[] = [];
  currentPage: number = 0;
  chart: Chart | null = null;
  datasets: {
    fileName: any; label: string; x_values: string[]; y_values: number[] 
}[] = [];

  fileSelected: boolean = false;
  moreFiles: boolean = false;
  lineStyles: string[] = [];
  markers: string[] = [];
  colors: string[] = [
  "#303C49", "#E40045", "#4489C5", "#6B9700", "#FFB500",
  "#CC0000", "#91B900", "#FFCD00", "#000000", "#838A92",
  "#33FF57", "#3357FF", "#FF33A1", "#FFD700", "#ADFF2F",
  "#7FFF00", "#00BFFF", "#1E90FF", "#FF4500", "#DA70D6",
  "#FF69B4", "#FF1493", "#8A2BE2", "#FFB6C1", "#CD5C5C",
  "#2E8B57", "#9ACD32", "#7B68EE", "#8B008B", "#FF6347",
  "#4682B4", "#D2691E", "#FF8C00"
]; 
 onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  
   this.datasets = [];

   if (input?.files?.length) {
    this.selectedFileNames = Array.from(input.files).map(file => file.name); 
    this.fileSelected = true; 
  Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
   reader.onload = (e: ProgressEvent<FileReader>) => {
       const content = e.target?.result as string;
       this.processFileContent(content, file.name); 
      };
 reader.readAsText(file);
    });
  } else {
    this.selectedFileNames = [];
    this.fileSelected = false;
  }
  this.lineStyles = Array(this.datasets.length).fill('solid');
}


processFileContent(content: string, fileName: string): void {
  
  const rows = content.split('\n');
  const parsedData = rows.map(row => row.split('\t')); 
   const xValues: string[] = parsedData.map(row => row[0]); 
  const yValues: number[] = parsedData.map(row => parseFloat(row[4])); 

  
  this.datasets.push({
    fileName: fileName,  
    label: fileName,     
    x_values: xValues,   
    y_values: yValues,   
  });

  this.lineStyles = Array(this.datasets.length).fill('solid');
}

initializeGraphData(response: any): void {
  this.datasets = response.datasets.map((dataset: any, index: number) => ({
    ...dataset,
    fileName: this.selectedFileNames[index] || `File ${index + 1}`,
  }));
  this.currentPage = 0; 
  this.plotCurrentDataset();
}


plotCurrentDataset(): void {
  if (this.datasets.length === 0 || this.currentPage >= this.datasets.length) {
    console.error('Invalid dataset or page index.');
    return;
  }

  const currentDataset = this.datasets[this.currentPage];
  const selectedStyle = this.lineStyles[this.currentPage]; 
  let borderDash: number[] = [];
  if (selectedStyle === 'dashed') {
    borderDash = [10, 5]; 
  } else if (selectedStyle === 'dotted') {
    borderDash = [2, 2]; 
  }
  if (this.chart) {
    this.chart.destroy(); 
  }

  const ctx = document.getElementById('chartCanvas') as HTMLCanvasElement;
  
  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: currentDataset.x_values,
      datasets: [
        {
          label: currentDataset.label,
          data: currentDataset.y_values,
          borderColor: this.getColor(this.currentPage),
          borderWidth: 2,
          pointStyle: 'circle',
          borderDash: borderDash
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'X Axis',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Y Axis',
          },
        },
      },
    },
  });
}
getColor(index: number): string {
  const colors = [
    '#303C49', '#E40045', '#4489C5', '#6B9700', '#FFB500',
    '#CC0000', '#91B900', '#FFCD00', '#000000', '#838A92',
    '#33FF57', '#3357FF', '#FF33A1', '#FFD700', '#ADFF2F',
  ];
  return colors[index % colors.length];
}
onPlotGraphClick(): void {
  if (this.selectedFileNames.length === 0) {
    console.error("No files selected for upload.");
    return;
  }

  
  const formData = new FormData();

  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (input && input.files) {
    Array.from(input.files).forEach((file) => {
      formData.append('files', file, file.name);
    });
  }

  
  this.graphService.uploadFiles(formData).subscribe(
    (response: any) => {
  
      this.datasets = response.datasets; 
      this.plotCurrentDataset();
    },
    (error) => {
      console.error('Error while uploading files:', error);
    }
  );
}

 
  
  onLineStyleChange(index: number): void {
  this.lineStyles[index] = this.lineStyles[index]  ;
    this.plotCurrentDataset();
  }
  previousDataset(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.plotCurrentDataset();
    }
  }
  nextDataset(): void {
  
    if (this.currentPage < this.datasets.length - 1) {
      this.currentPage++;
      
      this.plotCurrentDataset();
    }
  }
  onResetClick(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if(fileInput){
      fileInput.value = '';
    }
    this.datasets = [];
   this.selectedFileNames = [];
    this.fileSelected = false;
    this.currentPage = 0;
    if (this.chart) {
      this.chart.destroy(); 
    }
    console.log('Selection reset.');
  }
  
  
  }

 

  
  


