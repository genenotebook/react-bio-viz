import React from 'react';
import { cluster, hierarchy } from 'd3';
import randomColor from 'randomcolor';

const ADDITIVE_OFFSET = 400;
const ADDITIVE_MULTIPLIER = -120;


function TreeBranch({ node, cladogram, shadeBranchBySupport }: TreeNodeProps) {
  const offset = cladogram ? 0 : ADDITIVE_OFFSET;
  const multiplier = cladogram ? 1 : ADDITIVE_MULTIPLIER;
  const value = cladogram ? 'y' : 'value';
  const style = {
    fill: 'none',
    stroke: 'black',
    strokeWidth: 1,
    opacity: shadeBranchBySupport
      ? node.parent.data.name as unknown as number / 100
      : 1.
  };
  const d = `M${offset + (node.parent[value] * multiplier)},${node.parent.x} 
      L${offset + (node.parent[value] * multiplier)},${node.x} 
      L${offset + (node[value] * multiplier)},${node.x}`;
  return <path d={d} style={style} />;
}

function TipNode({ node, cladogram, color_regexp }: TreeNodeProps) {
  const { data, x } = node;
  const { name } = data;
  const value = cladogram ? 'y' : 'value';
  const offset = cladogram ? 0 : ADDITIVE_OFFSET;
  const multiplier = cladogram ? 1 : ADDITIVE_MULTIPLIER;
  const y = offset + (node[value] * multiplier)
  const colorSeed = typeof color_regexp !== 'undefined'
    ? (new RegExp(color_regexp).exec(name) || ['', 'name'])[1]
    : name
  const fill = randomColor({ seed: colorSeed });
  const style = { fill };
  return (
    <g className="tipnode">
      <title>{name}</title>
      <circle className="tipnode" cy={x} cx={y + 4} r="4.5" style={style} />
      <text x={y + 10} y={x + 4} fontSize="10">{name}</text>
    </g>
  );
}

function InternalNode({ node, cladogram }: TreeNodeProps) {
  const { data, x } = node;
  const value = cladogram ? 'y' : 'value';
  const offset = cladogram ? 0 : ADDITIVE_OFFSET;
  const multiplier = cladogram ? 1 : ADDITIVE_MULTIPLIER;
  const y = offset + (node[value] * multiplier)
  const { name } = data;
  return (
    <text x={y + 3} y={x + 3} fontSize="10">
      {name}
    </text>
  );
}

interface TreeNodeProps {
  node: Node,
  cladogram: boolean,
  showSupportValues?: boolean,
  shadeBranchBySupport?: boolean,
  color_regexp?: string
}

function TreeNode({
  node,
  cladogram,
  showSupportValues,
  color_regexp
}: TreeNodeProps) {
  if (typeof node.children === 'undefined') {
    return (
      <TipNode
        node={node}
        cladogram={cladogram}
        showSupportValues={showSupportValues}
        color_regexp={color_regexp}
      />
    )
  } else if (showSupportValues) {
    return (
      <InternalNode
        node={node}
        cladogram={cladogram}
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
}

interface TreeProps {
  tree: Tree,
  height?: number,
  width?: number,
  cladogram?: boolean,
  showSupportValues?: boolean,
  shadeBranchBySupport?: boolean,
  color_regexp?: string
}

export default function Tree({
  tree,
  height = 1100,
  width = 1000,
  cladogram = false,
  showSupportValues = true,
  shadeBranchBySupport = true,
  color_regexp = ' \\[([A-Za-z0-9\. ]+)\\]'
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

  const treeData = treeLayout(treeRoot).sum((node: any) => node.length);

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
                  cladogram={cladogram}
                  shadeBranchBySupport={shadeBranchBySupport}
                />
                <TreeNode
                  node={node}
                  cladogram={cladogram}
                  showSupportValues={showSupportValues}
                  color_regexp={color_regexp}
                />
              </React.Fragment>
            ))
          }
        </g>
      </svg>
    </div>
  )
}