<?php
/**
 * Plugin Name:       Summary Archive
 * Description:       A post archive using HTML summary drop-down elements.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.3.0
 * Author:            Carl Ansell
 * Author URI:        https://carlansell.co.uk
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       qb-summary-archive
 */

function summary_archive_render($attributes)
{
	wp_enqueue_style('summary-archive-style');
	ob_start();

	$archive = array();
	$result = new WP_Query(array('posts_per_page' => -1));

	while ($result->have_posts()):
		$result->the_post();
		$year = get_the_date('Y');
		$month = get_the_date('M');
		$archive[$year][$month][] = array(
			'url' => get_permalink(),
			'title' => get_the_title(),
		);
	endwhile;

	wp_reset_postdata();

	if (!empty($attributes['showTitle'])): ?>
		<div class="widget-block">
			<h3>Archive</h3>
		</div>
	<?php endif;

	foreach ($archive as $year => $months): ?>
		<div class="wp-block-carlansell94-summary-archive-container">
			<details>
				<summary><?php echo esc_html($year); ?></summary>
				<?php foreach ($months as $month => $posts) : ?>
					<details>
						<summary><?php echo esc_html($month); ?>
								<?php if (!empty($attributes['showPostCounts'])): ?>
								(<?php echo esc_html((string) count($posts)); ?>)
							<?php endif; ?>
						</summary>
						<ul>
							<?php foreach ($posts as $post): ?>
								<li>
									<a href="<?php echo esc_url($post['url']); ?>"><?php echo esc_html($post['title']); ?></a>
								</li>
							<?php endforeach; ?>
						</ul>
					</details>
				<?php endforeach; ?>
			</details>
		</div>
		<?php endforeach;

	return ob_get_clean();
}

function summary_archive_init()
{
	wp_register_style(
		'summary-archive-style',
		plugins_url('build/style-index.css', __FILE__),
		array(),
		'0.2.0'
	);

	register_block_type_from_metadata(
		__DIR__ . '/build',
		array(
			'render_callback' => 'summary_archive_render',
		)
	);
}

add_action( 'init', 'summary_archive_init' );
