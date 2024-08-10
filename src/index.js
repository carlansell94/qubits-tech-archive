const { registerBlockType } = wp.blocks;
const { PanelBody, ToggleControl, Disabled } = wp.components;
const { InspectorControls, useBlockProps } = wp.blockEditor;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

import './style.scss';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { showPostCounts, showTitle } = attributes;
		const posts = useSelect(select =>
            select('core').getEntityRecords('postType', 'post', { per_page: -1 })
        , []);

		const groupPostsByYearAndMonth = (posts) => {
            if (!posts) return [];

            const grouped = posts.reduce((acc, post) => {
				const date = new Date(post.date);
				const year = date.getFullYear();
				const month = date.toLocaleString('default', { month: 'long' });
		
				let yearGroup = acc.find(group => group.year === year);
				if (!yearGroup) {
					yearGroup = { year, months: [] };
					acc.push(yearGroup);
				}
		
				let monthGroup = yearGroup.months.find(m => m.month === month);
				if (!monthGroup) {
					monthGroup = { month, posts: [] };
					yearGroup.months.push(monthGroup);
				}
		
				monthGroup.posts.push(post);
				return acc;
			}, []);
		
			grouped.sort((a, b) => b.year - a.year);
		
			grouped.forEach(yearGroup => {
				yearGroup.months.sort((a, b) => new Date(`01 ${b.month} 0`) - new Date(`01 ${a.month} 0`));
			});
		
			return grouped;
        };

		const groupedPosts = groupPostsByYearAndMonth(posts);
	
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
				<div {...useBlockProps()}>
				{groupedPosts.map(yearGroup => (
    <details key={yearGroup.year}>
        <summary>{yearGroup.year}</summary>
        {yearGroup.months.map(monthGroup => (
            <details key={monthGroup.month}>
                <summary>{monthGroup.month}</summary>
                <ul>
                    {monthGroup.posts.map(post => (
                        <li key={post.id}>
                            {post.title.rendered}
                        </li>
                    ))}
                </ul>
            </details>
        ))}
    </details>
))}
                </div>
			</>
		)
	},
	save() {
		return null;
	},
} );
