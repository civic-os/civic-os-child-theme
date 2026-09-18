/*
 * Civic OS accessibility enhancements.
 *
 * Elementor's container layout is all <div>s, so semantic landmarks and a few
 * labels have to be added at runtime. Everything here is additive and defensive:
 * it never throws if an element is absent, and never overrides an attribute that
 * is already set.
 *
 * Covers audit items S1 (landmarks), S5 (SVG labels), and M1 (new-tab hint).
 * The header nav's dropdown/mobile ARIA and keyboard behavior live in the header
 * template widget itself, so they are intentionally not handled here.
 */
( function () {
	'use strict';

	function onReady( fn ) {
		if ( document.readyState !== 'loading' ) {
			fn();
		} else {
			document.addEventListener( 'DOMContentLoaded', fn );
		}
	}

	function setRoleIfMissing( el, role ) {
		if ( ! el ) {
			return;
		}
		var tag = el.tagName.toLowerCase();
		if ( el.getAttribute( 'role' ) ) {
			return;
		}
		if (
			( role === 'banner' && tag === 'header' ) ||
			( role === 'contentinfo' && tag === 'footer' ) ||
			( role === 'main' && tag === 'main' )
		) {
			return;
		}
		el.setAttribute( 'role', role );
	}

	onReady( function () {
		// --- S1: landmark roles on the header, main content, and footer. ---
		setRoleIfMissing( document.querySelector( '.elementor-location-header' ), 'banner' );
		setRoleIfMissing( document.querySelector( '.elementor-location-footer' ), 'contentinfo' );

		var main =
			document.querySelector(
				'.elementor-location-single, .elementor-location-archive, main#content, main.site-main'
			);
		if ( ! main ) {
			var blocks = document.querySelectorAll( '.elementor' );
			for ( var i = 0; i < blocks.length; i++ ) {
				if (
					! blocks[ i ].classList.contains( 'elementor-location-header' ) &&
					! blocks[ i ].classList.contains( 'elementor-location-footer' )
				) {
					main = blocks[ i ];
					break;
				}
			}
		}
		setRoleIfMissing( main, 'main' );

		// --- S5: decorative SVG icons inside a link that already has a text label. ---
		var svgs = document.querySelectorAll( 'a svg' );
		Array.prototype.forEach.call( svgs, function ( svg ) {
			var link = svg.closest( 'a' );
			if ( link && link.textContent.trim().length && ! svg.getAttribute( 'aria-label' ) ) {
				svg.setAttribute( 'aria-hidden', 'true' );
				svg.setAttribute( 'focusable', 'false' );
			}
		} );

		// --- M1: "opens in new tab" hint for target=_blank links. ---
		var newTab = document.querySelectorAll( 'a[target="_blank"]' );
		Array.prototype.forEach.call( newTab, function ( a ) {
			if ( a.querySelector( '.cos-sr-newtab' ) ) {
				return;
			}
			var span = document.createElement( 'span' );
			span.className = 'screen-reader-text cos-sr-newtab';
			span.textContent = ' (opens in new tab)';
			a.appendChild( span );
		} );
	} );
} )();
