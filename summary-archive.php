<?php
/**
 * Plugin Name:       Summary Archive
 * Description:       A post archive using HTML summary drop-down elements.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Carl Ansell
 * Author URI:        https://carlansell.co.uk
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       qb-summary-archive
 */

function qb_tech_archive_render($attributes)
{
	$archive = array();
	$result = new WP_Query(array('posts_per_page' => -1));

	while ($result->have_posts()): $result->the_post();
		$year = get_the_date('Y');
		$month = get_the_date('M');
		$url = get_permalink();
		$title = get_the_title(); 
			
		$archive[$year][$month][$url] = $title;
	endwhile;

	wp_reset_postdata();

	if ($attributes['showTitle']): ?>
		<div class="widget-block">
			<h3>Archive</h3>
		</div>
	<?php endif;

	foreach ($archive as $year => $months): ?>
		<details>
			<summary><?= $year ?></summary>
			<?php foreach ($months as $month => $posts): ?>
				<details>
					<summary><?= $month ?>
						<?php if ($attributes['showPostCounts']): ?>
							(<?= count($posts) ?>)
						<?php endif; ?>
					</summary>
					<ul>
						<?php foreach ($posts as $url => $title): ?>
							<li>
								<a href="<?= $url ?>"><?= $title ?></a>
							</li>
						<?php endforeach; ?>
					</ul>
				</details>
			<?php endforeach; ?>
		</details>
	<?php endforeach;
}

function qb_tech_archive_init()
{
	register_block_type_from_metadata(
		__DIR__ . '/build',
		array(
			'render_callback' => 'qb_tech_archive_render',
		)
	);
}

add_action( 'init', 'qb_tech_archive_init' );
