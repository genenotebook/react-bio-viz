import React from 'react';
import { cluster, hierarchy } from 'd3';
import randomColor from 'randomcolor';

function TreeBranch({ node, shadeBranchBySupport }: TreeNodeProps) {
  const style = {
    fill: 'none',
    stroke: 'black',
    strokeWidth: 1,
    opacity: shadeBranchBySupport
      ? node.parent.data.name as unknown as number / 100
      : 1.
  };
  const d = `M${node.parent.y},${node.parent.x}
    L${node.parent.y},${node.x}
    L${node.y},${node.x}`;
  return <path d={d} style={style} />;
}

function TipNode({ node, colorFunction, fontSize, alignTips }: TreeNodeProps) {
  const { data: { name }, x} = node;
  const textY = alignTips
    ? node.tipAlignY || (node.y + 10)
    : node.y + 10;
  const nodeY = node.y + 4;
  const colorSeed = typeof colorFunction !== 'undefined'
    ? colorFunction(node)
    : name
  const fill = randomColor({ seed: colorSeed });
  const circleStyle = { fill };
  const lineStyle = {
    stroke: 'darkgrey',
    strokeWidth: 1,
    strokeDasharray: '1,2'
  }
  return (
    <g className="tipnode">
      <title>{name}</title>
      <line x1={nodeY} x2={textY} y1={x} y2={x} style={lineStyle}/>
      <circle className="tipnode" cy={x} cx={nodeY} r="4.5" style={circleStyle} />
      <text x={textY} y={x + 4} fontSize={fontSize}>{name}</text>
    </g>
  );
}

function InternalNode({ node, fontSize }: TreeNodeProps) {
  const { data, x, y } = node;
  const { name } = data;
  return (
    <text x={y + 3} y={x + 3} fontSize={fontSize}>
      {name}
    </text>
  );
}

interface TreeNodeProps {
  node: Node,
  showSupportValues?: boolean,
  shadeBranchBySupport?: boolean,
  colorFunction?: CallableFunction,
  fontSize?: number,
  alignTips?: boolean
}

function TreeNode({
  node,
  showSupportValues,
  colorFunction,
  fontSize,
  alignTips
}: TreeNodeProps) {
  if (typeof node.children === 'undefined') {
    return (
      <TipNode
        node={node}
        fontSize={fontSize}
        showSupportValues={showSupportValues}
        colorFunction={colorFunction}
        alignTips={alignTips}
      />
    )
  } else if (showSupportValues) {
    return (
      <InternalNode
        node={node}
        fontSize={fontSize}
      />
    )
  }
  return null
}

interface Tree {
  ID?: string | number,
  name: string,
  color_regex?: string,
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
  tipAlignY?: number
}

interface TreeProps {
  tree: Tree,
  height?: number,
  width?: number,
  cladogram?: boolean,
  showSupportValues?: boolean,
  shadeBranchBySupport?: boolean,
  colorFunction?: CallableFunction,
  fontSize?: number,
  alignTips?: boolean
}

function defaultColorFunction(node: Node): string {
  const { data } =  node;
  const { name } = data;
  return name.slice(0,5);
}

function setNodeHeight(node: Node, currentHeight: number, scalingFactor: number): void {
  node.tipAlignY = node.y;
  node.y = (currentHeight + node.data.length) * scalingFactor;
  if (node.children) {
    node.children.forEach((childNode) => (
      setNodeHeight(childNode, currentHeight + node.data.length, scalingFactor)
    ))
  }
}

export default function Tree({
  tree,
  height = 900,
  width = 1000,
  cladogram = false,
  showSupportValues = true,
  shadeBranchBySupport = true,
  colorFunction = defaultColorFunction,
  fontSize = 10,
  alignTips = true
}: TreeProps): JSX.Element {
  const margin = {
    top: 10,
    bottom: 10,
    left: 20,
    right: 500,
  };

  const treeLayout = cluster()
    .size([
      height - margin.top - margin.bottom,
      width - margin.left - margin.right,
    ])
    .separation(() => 1);

  const treeRoot = hierarchy(tree, (node) => node.children);

  const treeData = treeLayout(treeRoot).sum((node: any) => node.depth);

  if (!cladogram) {
    const initialHeight = 0;
    const scalingFactor = 400;
    setNodeHeight(treeData as Node, initialHeight, scalingFactor);
  }
  
  const nodes = treeData.descendants().filter((node) => node.parent);

  return (
    <div className='tree'>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {
            nodes.map((node: any) => (
              <React.Fragment key={`${node.x}_${node.y}`}>
                <TreeBranch
                  node={node}
                  fontSize={fontSize}
                  shadeBranchBySupport={shadeBranchBySupport}
                />
                <TreeNode
                  node={node}
                  fontSize={fontSize}
                  showSupportValues={showSupportValues}
                  colorFunction={colorFunction}
                  alignTips={alignTips}
                />
              </React.Fragment>
            ))
          }
        </g>
      </svg>
    </div>
  )
}