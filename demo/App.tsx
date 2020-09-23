import React, { useReducer } from 'react';

import { GeneModel, MultipleSequenceAlignment, Tree } from '../src/index'

import gene from './data/genemodel.json'
// import msa from './data/multiple_sequence_alignment.json'
// import msa from './data/msa.json'
// import msa from './data/taq_pol_nr_blast.msa.json'
import msa from './data/plt1_test.msa.json'
// import tree from './data/tree.json'
import tree from './data/test.fixed_names.tree.json'

type State = {
  showCladogram: boolean,
  showSupportValues?: boolean,
  shadeBranchBySupport?: boolean
}

type Action =
  | { type: 'toggleShowCladogram' }
  | { type: 'toggleShowSupportValues' }
  | { type: 'toggleShadeBranchBySupport' }

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleShowCladogram':
      return { ...state, showCladogram: !state.showCladogram }
    case 'toggleShowSupportValues':
      return { ...state, showSupportValues: !state.showSupportValues }
    case 'toggleShadeBranchBySupport':
      return { ...state, shadeBranchBySupport: !state.shadeBranchBySupport }
    default:
      throw new Error('Invalid state operation');
  }
}

export default function App(): JSX.Element {
  const [state, dispatch] = useReducer(stateReducer, {
    showCladogram: true,
    showSupportValues: true,
    shadeBranchBySupport: false
  })

  return (
    <div className='container'>
      {/*
      <h5>GeneModel </h5>
      <GeneModel gene={gene} />
      */}
      <h5>Multiple Sequence Alignment (overview)</h5>
      <MultipleSequenceAlignment
        msa={msa}
        colWidth={1}
        rowHeight={12}
        showRowHeader={true}
        rowHeaderWidth={550}
        showText={false}
        palette={'individual'}
      />

      <h5>Multiple Sequence Alignment (detailed)</h5>
      <MultipleSequenceAlignment
        msa={msa}
        rowHeight={12}
        rowHeaderWidth={550}
        palette={'individual'}
      />

      <h5>Phylogenetic tree</h5>
      <label>
        <input
          type='checkbox'
          checked={state.showCladogram}
          onChange={() => dispatch({ type: 'toggleShowCladogram' })}
        />
        Cladogram
      </label>
      <label>
        <input
          type='checkbox'
          checked={state.showSupportValues}
          onChange={() => dispatch({ type: 'toggleShowSupportValues' })}
        />
        Show support values
      </label>
      <label>
        <input
          type='checkbox'
          checked={state.shadeBranchBySupport}
          onChange={() => dispatch({ type: 'toggleShadeBranchBySupport' })}
        />
        Shade branches by support values
      </label>
      <Tree
        tree={tree}
        cladogram={state.showCladogram}
        showSupportValues={state.showSupportValues}
        shadeBranchBySupport={state.shadeBranchBySupport}
      />
    </div>
  )
}