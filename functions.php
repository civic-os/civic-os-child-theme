<?php
/**
 * Civic OS Child — theme functions.
 *
 * Loads the self-hosted webfonts and the accessibility base stylesheet.
 * Everything here is additive on top of Hello Elementor; no parent markup is overridden.
 *
 * @package civic-os-child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

/**
 * Enqueue fonts first, then the accessibility base that depends on them.
 * Priority 20 so this lands after Hello Elementor and Elementor register their styles.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		$uri = get_stylesheet_directory_uri();
		$ver = '1.0.0';

		wp_enqueue_style( 'civic-os-fonts', $uri . '/assets/css/fonts.css', array(), $ver );
		wp_enqueue_style( 'civic-os-a11y', $uri . '/assets/css/accessibility.css', array( 'civic-os-fonts' ), $ver );
	},
	20
);
