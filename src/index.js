// SPDX-FileCopyrightText: © 2022-2024 Carl Ansell <github@carlansell.co.uk>
// SPDX-License-Identifier: GPL-3.0-or-later

const { registerBlockType } = wp.blocks;
const { PanelBody, ToggleControl } = wp.components;
const { InspectorControls, useBlockProps } = wp.blockEditor;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

import './editor.scss';
import './style.scss';
import metadata from './block.json';

const Edit = ( { attributes, setAttributes } ) => {
	const { showPostCounts, showTitle } = attributes;
	const allPosts = useSelect(
		( select ) =>
			select( 'core' ).getEntityRecords( 'postType', 'post', {
				per_page: -1,
			} ),
		[]
	);

	const getGroupedPosts = ( posts ) => {
		if ( ! posts ) return [];

		const groupedPosts = posts.reduce( ( acc, post ) => {
			const date = new Date( post.date );
			const year = date.getFullYear();
			const month = date.toLocaleString( 'default', {
				month: 'long',
			} );

			let yearGroup = acc.find( ( group ) => group.year === year );
			if ( ! yearGroup ) {
				yearGroup = { year, months: [] };
				acc.push( yearGroup );
			}

			let monthGroup = yearGroup.months.find(
				( m ) => m.month === month
			);
			if ( ! monthGroup ) {
				monthGroup = { month, posts: [] };
				yearGroup.months.push( monthGroup );
			}

			monthGroup.posts.push( post );
			return acc;
		}, [] );

		groupedPosts.sort( ( a, b ) => b.year - a.year );

		groupedPosts.forEach( ( yearGroup ) => {
			yearGroup.months.sort(
				( a, b ) =>
					new Date( `01 ${ b.month } 0` ) -
					new Date( `01 ${ a.month } 0` )
			);
		} );

		return groupedPosts;
	};

	const groupedPosts = getGroupedPosts( allPosts );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<ToggleControl
						label={ __( 'Show title' ) }
						checked={ showTitle }
						onChange={ () =>
							setAttributes( {
								showTitle: ! showTitle,
							} )
						}
					/>
					<ToggleControl
						label={ __( 'Show post counts' ) }
						checked={ showPostCounts }
						onChange={ () =>
							setAttributes( {
								showPostCounts: ! showPostCounts,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				{ showTitle && <h3>Archive</h3> }
				{ groupedPosts.map( ( yearGroup ) => (
					<details
						className="wp-block-carlansell94-summary-archive-year"
						key={ yearGroup.year }
					>
						<summary>{ yearGroup.year }</summary>
						{ yearGroup.months.map( ( monthGroup ) => (
							<details
								className="wp-block-carlansell94-summary-archive-month"
								key={ monthGroup.month }
							>
								<summary>
									{ monthGroup.month }
									{ showPostCounts &&
										` (${ monthGroup.posts.length })` }
								</summary>
								<ul>
									{ monthGroup.posts.map( ( post ) => (
										<li key={ post.id }>
											<span
												dangerouslySetInnerHTML={ {
													__html: post.title.rendered,
												} }
											/>
										</li>
									) ) }
								</ul>
							</details>
						) ) }
					</details>
				) ) }
			</div>
		</>
	);
};

registerBlockType( metadata.name, {
	edit: Edit,
	save() {
		return null;
	},
} );
