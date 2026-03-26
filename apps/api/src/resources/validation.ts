/**
 * Re-exporta validación desde el paquete compartido.
 */
export {
	validateCreateResource,
	validateUpdateResource,
	validateStatus,
	validateTransition,
	VALID_STATUSES,
	VALID_LANGUAGES,
	VALID_LICENSES,
	TRANSITION_RULES,
	ROLE_LEVELS,
	type EditorialStatus,
	type ValidationError,
	type ValidationResult,
} from "@procomeka/db/validation";
