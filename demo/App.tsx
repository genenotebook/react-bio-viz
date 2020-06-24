import React from 'react';

import { GeneModel, MultipleSequenceAlignment } from '../src/index'

import gene from './data/genemodel.json'
import msa from './data/multiple_sequence_alignment.json'

export default function App(): JSX.Element {
  return (
    <div className='container'>
      <h5>GeneModel </h5>
      <GeneModel gene={gene} />
      <h5>Multiple Sequence Alignment (small)</h5>
      <MultipleSequenceAlignment msa={msa} colWidth={1} rowHeight={5} />
      <h5>Multiple Sequence Alignment (big)</h5>
      <MultipleSequenceAlignment msa={msa} />
    </div>
  )
}