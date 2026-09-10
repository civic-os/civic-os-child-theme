<?php
/**
 * Civic OS Child — theme functions.
 *
 * Loads the self-hosted webfonts and the accessibility + layout base stylesheets,
 * and wires GitHub-release self-updates. Everything here is additive on top of
 * Hello Elementor; no parent markup is overridden.
 *
 * @package civic-os-child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

/**
 * Enqueue fonts first, then the accessibility and layout bases that depend on them.
 * Priority 20 so this lands after Hello Elementor and Elementor register their styles.
 * Asset version tracks the theme Version (style.css) so each release busts CSS caches.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		$uri = get_stylesheet_directory_uri();
		$ver = wp_get_theme()->get( 'Version' );

		wp_enqueue_style( 'civic-os-fonts', $uri . '/assets/css/fonts.css', array(), $ver );
		wp_enqueue_style( 'civic-os-a11y', $uri . '/assets/css/accessibility.css', array( 'civic-os-fonts' ), $ver );
		wp_enqueue_style( 'civic-os-layout', $uri . '/assets/css/layout.css', array( 'civic-os-a11y' ), $ver );
	},
	20
);

/**
 * Self-updates from GitHub Releases.
 *
 * Uses the bundled Plugin Update Checker (YahnisElsts/plugin-update-checker, v5).
 * WordPress checks the theme's GitHub repository and surfaces a newer release under
 * Network Admin > Themes, updatable in one click (or via auto-updates).
 *
 * To publish an update: bump Version in style.css, commit, and cut a GitHub Release
 * whose tag matches (for example v1.2.0). A public repository needs nothing more. For
 * a private repository, define a token in wp-config.php (kept out of the theme):
 *
 *     define( 'CIVIC_OS_CHILD_GH_TOKEN', 'ghp_your_read_only_token' );
 */
$cos_puc = get_stylesheet_directory() . '/vendor/plugin-update-checker/plugin-update-checker.php';
if ( is_readable( $cos_puc ) ) {
	require_once $cos_puc;

	$cos_update_checker = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
		'https://github.com/civic-os/civic-os-child-theme/',
		get_stylesheet_directory(),
		'civic-os-child'
	);

	// Published Releases take precedence; 'main' is only the fallback if none exist.
	$cos_update_checker->setBranch( 'main' );

	// Only needed while the repository is private; harmless to leave defined.
	if ( defined( 'CIVIC_OS_CHILD_GH_TOKEN' ) && CIVIC_OS_CHILD_GH_TOKEN ) {
		$cos_update_checker->setAuthentication( CIVIC_OS_CHILD_GH_TOKEN );
	}
}
