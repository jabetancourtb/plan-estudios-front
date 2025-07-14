import { ChangeDetectionStrategy, Component, ElementRef, ViewChild  } from '@angular/core';
import * as go from 'gojs';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';


@Component({
  selector: 'app-plan-estudios-tabla',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './plan-estudios-tabla.component.html',
  styleUrl: './plan-estudios-tabla.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEstudiosTablaComponent {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: ElementRef;

  public diagramNodeData = [
    { key: 1, header: 'Supplier', text: 'Planned Order Variations', footer: 'Retailer', role: 'b' },
    { key: 2, header: 'Supplier', text: 'Order & Delivery Variations', footer: 'Retailer', role: 't', loop: true },
    { key: 3, header: 'Group 1', isGroup: true, footer: 'Shipper', role: 'b' },
    { key: 4, header: 'Supplier', text: 'Inner Node A', footer: 'Retailer', role: 'b', group: 3 },
    { key: 5, header: 'Supplier', text: 'Inner Node B', footer: 'Retailer', role: 't', group: 3 }
  ];


  public diagramLinkData = [
    { key: -1, from: 1, to: 2 },
    { key: -2, from: 2, to: 3 },
    { key: -3, from: 4, to: 5 }
  ];

  public stateData = {

    diagramNodeData: [
      { key: 1, header: 'Supplier', text: 'Planned Order Variations', footer: 'Retailer', role: 'b' },
      { key: 2, header: 'Supplier', text: 'Order & Delivery Variations', footer: 'Retailer', role: 't', loop: true },
      { key: 3, header: 'Group 1', isGroup: true, footer: 'Shipper', role: 'b' },
      { key: 4, header: 'Supplier', text: 'Inner Node A', footer: 'Retailer', role: 'b', group: 3 },
      { key: 5, header: 'Supplier', text: 'Inner Node B', footer: 'Retailer', role: 't', group: 3 }
    ],

    diagramLinkData: [
      { key: -1, from: 1, to: 2 },
      { key: -2, from: 2, to: 3 },
      { key: -3, from: 4, to: 5 }
    ],

    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,
    selectedNodeData: [], // used by InspectorComponent

  }

  public observedDiagram! : any;


  ngOnInit() {
    this.initDiagram();
  }

  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, this.myDiagramComponent.nativeElement, {
      layout: $(go.TreeLayout, {
        setsPortSpot: false,
        setsChildPortSpot: false,
        isRealtime: false
      }),
      'undoManager.isEnabled': true
    });

     diagram.groupTemplate = $(
      go.Group, 'Vertical',
      {
        layout: $(go.TreeLayout, {
          setsPortSpot: false,
          setsChildPortSpot: false
        }),
        defaultStretch: go.GraphObject.Horizontal,
        fromSpot: go.Spot.RightSide,
        toSpot: go.Spot.LeftSide
      },
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedRectangle', { fill: 'white', parameter2: 1 | 2 })
          .bind('fill', 'role', r => r[0] === 't' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, { fill: 'white' }),
        $(go.Placeholder, { padding: 20 })
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedRectangle', { fill: 'white', parameter2: 4 | 8 })
          .bind('fill', 'role', r => r[0] === 'b' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
    );

    diagram.nodeTemplate = $(
      go.Node, 'Vertical',
      { defaultStretch: go.GraphObject.Horizontal, fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide },
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedTopRectangle', { fill: 'white' })
          .bind('fill', 'role', r => r[0] === 't' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),
      $(go.Panel, 'Auto', { minSize: new go.Size(NaN, 70) },
        $(go.Shape, 'Rectangle', { fill: 'white' }),
        $(go.TextBlock, { width: 120, margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text')
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedBottomRectangle', { fill: 'white' })
          .bind('fill', 'role', r => r[0] === 'b' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
    );

    diagram.linkTemplate = $(
      go.Link,
      { routing: go.Routing.Orthogonal, corner: 5 },
      $(go.Shape),
      $(go.Shape, { toArrow: 'Triangle' })
    );

    const model = new go.GraphLinksModel(this.diagramNodeData, this.diagramLinkData);
    model.linkKeyProperty = 'key';
    diagram.model = model;

    return diagram;
  }


}
