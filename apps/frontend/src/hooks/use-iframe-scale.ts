import { useEffect, useRef } from "react";

export interface IframeScaleOptions {
	/** Native width of the iframe content (default 1024). */
	iframeWidth?: number;
	/** Native height of the iframe content (default 768). */
	iframeHeight?: number;
	/**
	 * When true, scale to fill the wrapper width (content may overflow
	 * vertically, hidden by overflow:hidden on the container).
	 * When false (default), scale to fit within both width and height.
	 */
	fillWidth?: boolean;
}

/**
 * Hook that returns a ref to attach to a wrapper div containing an <iframe>.
 * It automatically scales the iframe to fit the wrapper using CSS transform.
 *
 * The wrapper should have `overflow: hidden` and the iframe should have
 * `transform-origin: 0 0` set via CSS.
 */
export function useIframeScale<T extends HTMLElement = HTMLDivElement>(
	options: IframeScaleOptions = {},
): React.RefObject<T | null> {
	const { iframeWidth = 1024, iframeHeight = 768, fillWidth = false } = options;
	const ref = useRef<T | null>(null);

	useEffect(() => {
		if (!ref.current) return;
		const wrapper = ref.current;
		const iframe = wrapper.querySelector("iframe");
		if (!iframe) return;

		if (iframeWidth) {
			iframe.style.width = `${iframeWidth + 20}px`;
		}
		if (iframeHeight) {
			iframe.style.height = `${iframeHeight}px`;
		}

		function rescale() {
			const w = wrapper.clientWidth || 280;
			const h = wrapper.clientHeight || 200;
			const scale = fillWidth
				? w / iframeWidth
				: Math.min(w / iframeWidth, h / iframeHeight);
			iframe!.style.transform = `scale(${scale})`;
		}

		rescale();
		window.addEventListener("resize", rescale);
		return () => window.removeEventListener("resize", rescale);
	}, [iframeWidth, iframeHeight, fillWidth]);

	return ref;
}
