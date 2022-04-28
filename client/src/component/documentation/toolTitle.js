import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Divider } from '@mui/material';

export default function ToolTitle(props) {

    return (
        <>
            <Typography variant='h3' marginTop={5} align='left'>{props.tool.name}</Typography>
            <Divider />
            <Typography variant='h5' marginTop={5} align='left'>{props.tool.type}</Typography>
            <Typography variant='body1' marginTop={5} align='left'>{props.tool.description}</Typography>
            <Typography variant='h5' marginTop={5} align='left'>Usage</Typography>
            <Divider />
            <Typography variant='body1' marginTop={5} align='center'>{props.tool.library.name} [arguments] [options]</Typography>
        </>
    )
}