import React, { useReducer } from "react";

import { GeneModel, MultipleSequenceAlignment, Tree } from "../src/index";

// import gene from './data/genemodel.json'
// import msa from './data/multiple_sequence_alignment.json'
// import msa from './data/msa.json'
// import msa from './data/taq_pol_nr_blast.msa.json'
// import msa from './data/plt1_test.msa.json'
// import tree from './data/tree.json'
// import tree from './data/test.fixed_names.tree.json'

function loadJson(filename: string): any {
  const request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open("GET", filename, false);
  request.send(null);
  return JSON.parse(request.responseText);
}

type State = {
  showCladogram: boolean;
  showSupportValues?: boolean;
  shadeBranchBySupport?: boolean;
  fontSize?: number;
  width?: number;
  height?: number;
};

type Action =
  | { type: "toggleShowCladogram" }
  | { type: "toggleShowSupportValues" }
  | { type: "toggleShadeBranchBySupport" }
  | { type: "setFontSize"; value: number }
  | { type: "setWidth"; value: number }
  | { type: "setHeight"; value: number };

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case "toggleShowCladogram":
      return { ...state, showCladogram: !state.showCladogram };
    case "toggleShowSupportValues":
      return { ...state, showSupportValues: !state.showSupportValues };
    case "toggleShadeBranchBySupport":
      return { ...state, shadeBranchBySupport: !state.shadeBranchBySupport };
    case "setFontSize":
      return { ...state, fontSize: action.value };
    case "setWidth":
      return { ...state, width: action.value };
    case "setHeight":
      return { ...state, height: action.value };
    default:
      throw new Error("Invalid state operation");
  }
}

declare const msa: any;
declare const tree: any;

export default function App(): JSX.Element {
  const tree = loadJson("./data/tree.json");
  const msa = loadJson("./data/msa.json");
  const geneModel = loadJson("./data/genemodel.json");
  const [state, dispatch] = useReducer(stateReducer, {
    showCladogram: false,
    showSupportValues: true,
    shadeBranchBySupport: true,
    fontSize: 11,
    width: 940,
    height: 740,
  });

  return (
    <div className="container">
      <h5>GeneModel </h5>
      <GeneModel gene={geneModel} />

      <h5>Multiple Sequence Alignment (overview)</h5>
      <MultipleSequenceAlignment
        msa={msa}
        colWidth={1}
        width={750}
        rowHeight={0.5}
        showRowHeader={true}
        rowHeaderWidth={150}
        showText={false}
        palette="individual"
      />

      <h5>Multiple Sequence Alignment (detailed)</h5>
      <MultipleSequenceAlignment
        msa={msa}
        rowHeight={12}
        rowHeaderWidth={150}
        height={500}
        palette="individual"
      />

      <h5>Phylogenetic tree</h5>
      <label>
        <input
          type="checkbox"
          checked={state.showCladogram}
          onChange={() => dispatch({ type: "toggleShowCladogram" })}
        />
        Cladogram
      </label>
      <label>
        <input
          type="checkbox"
          checked={state.showSupportValues}
          onChange={() => dispatch({ type: "toggleShowSupportValues" })}
        />
        Show support values
      </label>
      <label>
        <input
          type="checkbox"
          checked={state.shadeBranchBySupport}
          onChange={() => dispatch({ type: "toggleShadeBranchBySupport" })}
        />
        Shade branches by support values
      </label>
      <br />
      <label>
        Font size
        <input
          type="number"
          value={state.fontSize}
          onChange={({ target: { value } }) =>
            dispatch({
              type: "setFontSize",
              value: Number(value),
            })
          }
          style={{
            width: "4em",
            marginRight: "1em",
          }}
        />
      </label>

      <label>
        Width
        <input
          type="number"
          value={state.width}
          onChange={({ target: { value } }) =>
            dispatch({
              type: "setWidth",
              value: Number(value),
            })
          }
          style={{
            width: "6em",
            marginRight: "1em",
          }}
        />
      </label>

      <label>
        Height
        <input
          type="number"
          value={state.height}
          onChange={({ target: { value } }) =>
            dispatch({
              type: "setHeight",
              value: Number(value),
            })
          }
          style={{
            width: "6em",
            marginRight: "1em",
          }}
        />
      </label>
      <Tree
        tree={tree}
        cladogram={state.showCladogram}
        showSupportValues={state.showSupportValues}
        shadeBranchBySupport={state.shadeBranchBySupport}
        fontSize={state.fontSize}
        width={state.width}
        height={state.height}
      />
    </div>
  );
}
