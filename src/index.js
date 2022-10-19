import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType( metadata.name, {
	edit: Edit,
	save( attributes ) {
		const blockProps = useBlockProps.save();
		return <div { ...blockProps }>{ attributes.message }</div>;
	},
} );
