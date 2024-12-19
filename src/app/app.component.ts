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
  
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input?.files?.length) {
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
  
    this.chart = new Chart('chartCanvas', {
      type: 'line',
      data: {
        labels: dataset.x_values,
        datasets: [
          {
            label: `${dataset.label} (${dataset.fileName})`, 
            data: dataset.y_values,
            borderColor: this.getRandomColor(),
            backgroundColor: this.getRandomColor(0.5),
            fill: false,
          },
        ],
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
  

  
  }

 

  
  


