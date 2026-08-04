import { apiFetch } from "@lattice-php/core/api";
//#region resources/js/lib/form-transport.ts
/**
* Shared client transport for the lattice form endpoint: every form sub-action
* (validation resolve, option search) POSTs to the same signed URL, so the
* request shape lives here once.
*/
var FORM_DEBOUNCE_MS = 250;
function postFormAction(action, componentRef, body, signal) {
	return apiFetch(action, {
		method: "POST",
		ref: componentRef,
		signal,
		body: JSON.stringify(body),
		throwOnError: false
	}).then((response) => response.ok ? response.json() : null);
}
//#endregion
export { FORM_DEBOUNCE_MS, postFormAction };

//# sourceMappingURL=form-transport.js.map