/*
 * Civic OS accessibility enhancements.
 *
 * Elementor's container layout is all <div>s, so semantic landmarks, ARIA state,
 * and a few labels have to be added at runtime. Everything here is additive and
 * defensive: it never throws if an element is absent, and never overrides an
 * attribute that is already set.
 *
 * Covers audit items S1 (landmarks), S3 (dropdown ARIA), S5 (SVG labels),
 * M1 (new-tab hint), and M4 (mobile menu state).
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
		// A native element already carrying the semantics needs no role.
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
			// Fallback: the first .elementor block that is not the header or footer.
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

		// --- S3: announce the header dropdowns to assistive tech (CSS handles the
		// keyboard reveal via :focus-within; here we expose haspopup + state). ---
		var dropdowns = document.querySelectorAll( '.civic-header-nav .has-dropdown' );
		Array.prototype.forEach.call( dropdowns, function ( li ) {
			var trigger = li.querySelector( 'a' );
			var menu = li.querySelector( '.dropdown-menu' );
			if ( ! trigger || ! menu ) {
				return;
			}
			trigger.setAttribute( 'aria-haspopup', 'true' );
			trigger.setAttribute( 'aria-expanded', 'false' );

			var sync = function ( open ) {
				trigger.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
			};
			li.addEventListener( 'mouseenter', function () { sync( true ); } );
			li.addEventListener( 'mouseleave', function () { sync( false ); } );
			li.addEventListener( 'focusin', function () { sync( true ); } );
			li.addEventListener( 'focusout', function ( e ) {
				if ( ! li.contains( e.relatedTarget ) ) { sync( false ); }
			} );
			// Escape closes and returns focus to the trigger.
			menu.addEventListener( 'keydown', function ( e ) {
				if ( e.key === 'Escape' || e.key === 'Esc' ) {
					trigger.focus();
				}
			} );
		} );

		// --- M4: keep the mobile hamburger's aria-expanded in sync. ---
		var toggle = document.querySelector( '.mobile-menu-toggle' );
		var nav = document.querySelector( '.civic-header-nav' );
		if ( toggle && nav ) {
			if ( ! nav.id ) {
				nav.id = 'civic-header-nav';
			}
			toggle.setAttribute( 'aria-expanded', 'false' );
			toggle.setAttribute( 'aria-controls', nav.id );
			toggle.addEventListener( 'click', function () {
				// The inline handler toggles .active; read it back on the next tick.
				window.setTimeout( function () {
					toggle.setAttribute(
						'aria-expanded',
						nav.classList.contains( 'active' ) ? 'true' : 'false'
					);
				}, 0 );
			} );
		}
	} );
} )();
