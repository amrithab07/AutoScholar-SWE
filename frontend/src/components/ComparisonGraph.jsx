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

export default function ComparisonGraph({ papers = [], comparison = {}, onNodeClick }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: defaultStyle,
      layout: { name: 'cose-bilkent', idealEdgeLength: 150, nodeRepulsion: 40000 },
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeClick) onNodeClick(node.data());
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [onNodeClick]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const elems = [];
    const added = new Set();

    // Add paper nodes
    papers.forEach(p => {
      const id = String(p.id);
      if (!added.has(id)) {
        elems.push({ data: { id, label: p.title || p.name || 'Paper', type: 'paper' } });
        added.add(id);
      }
    });
    
    // Process comparison data to create nodes and edges
    // This is a placeholder. We will need to adapt this to the actual data structure.
    if (comparison.common) {
        const commonId = 'common_points';
        if(!added.has(commonId)) {
            elems.push({ data: { id: commonId, label: 'Common Points', type: 'common' } });
            added.add(commonId);
        }
        papers.forEach(p => {
            const paperId = String(p.id);
            const edgeId = `${paperId}-${commonId}`;
            elems.push({ data: { id: edgeId, source: paperId, target: commonId } });
        });
    }

    if (comparison.unique) {
        Object.keys(comparison.unique).forEach(paperId => {
            const uniqueId = `unique_${paperId}`;
            if(!added.has(uniqueId)) {
                const paper = papers.find(p => String(p.id) === paperId);
                const label = `Unique to\n${paper ? paper.title || paper.name : 'Paper'}`;
                elems.push({ data: { id: uniqueId, label: label, type: 'unique' } });
                added.add(uniqueId);
            }
            const edgeId = `${paperId}-${uniqueId}`;
            elems.push({ data: { id: edgeId, source: paperId, target: uniqueId } });
        });
    }


    cy.json({ elements: elems });
    cy.layout({ name: 'cose-bilkent', idealEdgeLength: 150, nodeRepulsion: 40000 }).run();
  }, [papers, comparison]);

  return (
    <div style={{ width: '100%', height: 480, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 }} ref={containerRef} />
  );
}
