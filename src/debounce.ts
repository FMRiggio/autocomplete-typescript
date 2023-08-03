export const debounce = (func: Function, timeout = 300) => {
	let debounceTimer: any;
	return (...args: any) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => { func.apply(this, args); }, timeout);
	};
}
