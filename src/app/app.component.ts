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
  
    if (input?.files?.length) {

      this.selectedFileNames = Array.from(input.files).map(file => file.name);
      this.lineStyles = this.selectedFileNames.map(() => 'solid');
      this.markers = this.selectedFileNames.map(() => 'circle');
      
      this.fileSelected = true;
  
      this.datasets = []; 
      const files = Array.from(input.files);
  
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const content = JSON.parse(e.target?.result as string);
            const fileDatasets = content.datasets.map((dataset: any) => ({
              ...dataset,
              fileName: file.name, 
            }));
  
            this.datasets.push(...fileDatasets);
  
    
            if (this.datasets.length === fileDatasets.length) {
              this.currentPage = 0; 
              
            }
          } catch (error) {
            console.error('Invalid JSON format:', error);
            alert(`Invalid JSON file: ${file.name}`);
          }
        };
        reader.readAsText(file);
      });
    }
  }
  
  fetchData(): void {
    this.graphService.getData().subscribe((response: any) => {
      this.datasets = response.datasets.map((dataset: any) => ({
        ...dataset,
        fileName: 'Fetched Data', 
      }));
  
      this.currentPage = 0;
      this.plotGraph();
    });
  }
  
  plotGraph(): void {
    if (!this.datasets.length) return;
  
    const dataset = this.datasets[this.currentPage];
  
    if (this.chart) {
      this.chart.destroy();
    }
  
    const chartDatasets = this.datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.y_values,
      borderColor: this.colors[index], 
      backgroundColor: this.colors[index] + '80', 
      fill: false,
    }));


    this.chart = new Chart('chartCanvas', {
      type: 'line',
      data: {
        labels: dataset.x_values,
        datasets: chartDatasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time Period',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Values',
            },
          },
        },
      },
    });
  }
  
  nextPage(): void {
    if (this.currentPage < this.datasets.length - 1) {
      this.currentPage++;
      this.plotGraph();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.plotGraph();
    }
  }
  
  private getRandomColor(alpha = 1): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  
  onOkClick(): void {
    if (this.fileSelected) {
      console.log('Files selected:', this.selectedFileNames);
      
    } else {
      alert('No files selected!');
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

 

  
  


