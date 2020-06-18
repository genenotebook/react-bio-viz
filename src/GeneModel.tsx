import * as React from 'react';

export interface GeneModelProps { ID: string, data: Record<string, unknown> }

export default function GeneModel({ ID, data }: GeneModelProps): JSX.Element {
    return (
        <div>
            <h5>GeneModel {ID}</h5>
            {data}
            <svg />
        </div>
    )
}