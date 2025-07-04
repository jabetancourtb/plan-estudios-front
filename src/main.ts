import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  VisualMapComponent,
  DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CustomChart } from 'echarts/charts';

echarts.use([
  CanvasRenderer,
  CustomChart,
  TooltipComponent,
  VisualMapComponent,
  DatasetComponent
]);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
