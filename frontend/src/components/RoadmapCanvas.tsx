import { memo, useMemo } from 'react'; 
import ReactFlow, { Background, type Node, type Edge, } from 'reactflow';
import "reactflow/dist/style.css";
import styles from './RoadmapCanvas.module.css';

interface RoadmapCanvasProps {
    data: {
        steps: string[];
    }; 
}

export const RoadmapCanvas = memo(({ data }: RoadmapCanvasProps) => {
    console.log(data);
    const { nodes, edges } = useMemo(() => {
      if (!data || !data.steps?.length) return { nodes: [], edges: [] };

        const sectionRegex = /^[IVXLCDM]+\./i;
        const grouped: { title: string; substeps: string[] }[] = [];

        let currentSection: { title: string; substeps: string[] } | null = null;

        data.steps.forEach(step => {
            if (sectionRegex.test(step)) {
                if (currentSection) grouped.push(currentSection);
                currentSection = { title: step, substeps: [] };
            } else {
                currentSection?.substeps.push(step);
            }
        });

        if (currentSection) grouped.push(currentSection); 

        const allNodes: Node[] = [];
        const allEdges: Edge[] = [];

        let xOffset = 100;

        grouped.forEach((group, sectionIndex) => {
            const sectionId = `section-${sectionIndex}`;
            allNodes.push({
                id: sectionId,
                data: { label: group.title },
                position: { x: xOffset, y: 100 },
                style: {
                    backgroundColor: '#FFD700',
                    color: '#000',
                    padding: 10,
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '16px',
                    width: 280,
                    border: '2px solid #555',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                },
            });

            group.substeps.forEach((substep, subIndex) => {
                const subId = `${sectionId}-step-${subIndex}`;
                const yPos = 200 + subIndex * 120;
                allNodes.push({
                    id: subId,
                    data: { label: substep },
                    position: { x: xOffset, y: yPos },
                    style: {
                        backgroundColor: '#E1F5FE',
                        color: '#222',
                        padding: 10,
                        borderRadius: 6,
                        width: 260,
                        fontSize: '14px',
                        border: '1px solid #2196F3',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    },
                });

                allEdges.push({
                    id: `edge-${sectionId}-${subId}`,
                    source: sectionId,
                    target: subId,
                    type: 'smoothstep',
                });
            });

            if (sectionIndex > 0) {
                const prevId = `section-${sectionIndex - 1}`;
                allEdges.push({
                    id: `edge-${prevId}-${sectionId}`,
                    source: prevId,
                    target: sectionId,
                    type: 'smoothstep',
                });
            }

            xOffset += 350; 
        });

        return { nodes: allNodes, edges: allEdges };
    }, [data]);
    return (
        <div className={styles.canvasWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                defaultEdgeOptions={{ type: "smoothstep", animated: true }}
            >
                <Background gap={12} size={1} />
            </ReactFlow>
        </div>
    );
});