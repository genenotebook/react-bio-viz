import React from 'react';
import { cluster, hierarchy } from 'd3';
import randomColor from 'randomcolor';

function TreeBranch({ node, cladogram }: TreeNodeProps) {
  const offset = cladogram ? 0 : 20;
  const multiplier = cladogram ? 1 : -10;
  const value = cladogram ? 'y' : 'value';
  const style = { fill: 'none', stroke: 'black', strokeWidth: 1 };
  const d = `M${offset + (node.parent[value] * multiplier)},${node.parent.x} 
      L${offset + (node.parent[value] * multiplier)},${node.x} 
      L${offset + (node[value] * multiplier)},${node.x}`;
  return <path d={d} style={style} />;
}

function TipNode({ node, cladogram }: TreeNodeProps) {
  const { data, x, y } = node;
  const { ID, name } = data;
  const fill = randomColor({ seed: name.slice(0, 3) });
  const style = { fill };
  return (
    <g className="tipnode">
      <circle className="orthogroup-node" cy={x} cx={y} r="4.5" style={style} />
      <text x={y + 6} y={x + 4} fontSize="10">{name}</text>
    </g>
  );
}

function InternalNode({ node, cladogram }: TreeNodeProps) {
  const { data, x, y } = node;
  const { name } = data;
  return (
    <text x={y + 3} y={x + 3} fontSize="10">
      {name}
    </text>
  );
}

interface TreeNodeProps {
  node: Node,
  cladogram: boolean
}

function TreeNode({ node, cladogram }: TreeNodeProps) {
  return typeof node.children === 'undefined'
    ? <TipNode node={node} cladogram={cladogram} />
    : <InternalNode node={node} cladogram={cladogram} />;
}

interface Tree {
  ID: string | number,
  name: string,
  length: number,
  children: Tree[],
}

interface Node {
  children?: Node[],
  data: Tree,
  depth: number,
  height: number,
  parent: Node,
  value: number,
  x: number,
  y: number,
}

interface TreeProps {
  tree: Tree,
  height?: number,
  width?: number,
  cladogram?: boolean
}

export default function Tree({
  tree,
  height = 500,
  width = 500,
  cladogram = true
}: TreeProps): JSX.Element {
  const margin = {
    top: 10,
    bottom: 10,
    left: 20,
    right: 100,
  };

  const treeMap = cluster()
    .size([
      height - margin.top - margin.bottom,
      width - margin.left - margin.right,
    ])
    .separation(() => 1);

  const treeRoot = hierarchy(tree, (node) => node.children);

  const treeData = treeMap(treeRoot).sum((node: any) => node.length);

  const nodes = treeData.descendants().filter((node) => node.parent);

  return (
    <div className='tree'>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {
            nodes.map((node: any) => (
              <React.Fragment key={`${node.x}_${node.y}`}>
                <TreeBranch node={node} cladogram={cladogram} />
                <TreeNode node={node} cladogram={cladogram} />
              </React.Fragment>
            ))
          }
        </g>
      </svg>
    </div>
  )
}