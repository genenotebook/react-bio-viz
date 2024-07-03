# react-bio-viz

React components for biological data visualization

- Gene model
- Multiple Sequence Alignment
- Phylogenetic tree

To install

```
npm install react-bio-viz
```

To use

```jsx
import React from 'react';

import { GeneModel, MultipleSequenceAlignment, Tree } from 'react-bio-viz'

import { genemodel, msa, tree } from './src/data'

function App(): JSX.Element {
  return (
    <div className='react-bio-viz'>
      <GeneModel gene={gene} />

      <MultipleSequenceAlignment
        msa={msa}
        colWidth={1}
        rowHeight={5}
        showRowHeader={false}
      />

      <Tree tree={tree} />
    </div>
  )
}
```

To see examples, start a development server (loading is currently slow)

```
git clone https://github.com/genenotebook/react-bio-viz
cd react-bio-viz
npm install
npm run dev
```

![showcase](showcase.png 'react-bio-viz examples')
