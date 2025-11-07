import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register layout
cytoscape.use(coseBilkent);

const defaultStyle = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#1976d2',
      'color': '#fff',
      'width': 'label',
      'height': 'label',
      'padding': '8px',
      'shape': 'round-rectangle',
      'font-size': 12,
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#9e9e9e',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#9e9e9e',
      'curve-style': 'bezier'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': '#ff9800',
      'text-outline-color': '#ff9800'
    }
  }
];

export default function CitationGraph({ nodes = [], edges = [], onNodeClick, onElementClick }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // initialize cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: defaultStyle,
      layout: { name: 'cose-bilkent', idealEdgeLength: 80, nodeRepulsion: 20000 },
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeClick) onNodeClick(node.data());
      if (onElementClick) onElementClick({ type: 'node', data: node.data() });
    });
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      if (onElementClick) onElementClick({ type: 'edge', data: edge.data() });
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [onNodeClick]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // convert nodes/edges to cytoscape elements
    const elems = [];
    const added = new Set();

    nodes.forEach(n => {
      const id = String(n.id);
      if (!added.has(id)) {
        elems.push({ data: { id, label: `${n.title}${n.year ? ` (${n.year})` : ''}`, meta: n } });
        added.add(id);
      }
    });

    edges.forEach(e => {
      const src = String(e.source);
      const tgt = String(e.target);
      const eid = `${src}-${tgt}-${e.relation}`;
      // include any extra metadata (e.g., evidence) on the edge data so consumers can inspect it
      elems.push({ data: { id: eid, source: src, target: tgt, relation: e.relation, evidence: e.evidence || [] } });
    });

    cy.json({ elements: elems });
    cy.layout({ name: 'cose-bilkent', idealEdgeLength: 80, nodeRepulsion: 20000 }).run();
  }, [nodes, edges]);

  return (
    <div style={{ width: '100%', height: 480, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 }} ref={containerRef} />
  );
}
