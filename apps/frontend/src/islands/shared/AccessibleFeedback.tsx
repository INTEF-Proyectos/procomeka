interface AccessibleFeedbackProps {
	id?: string;
	message: string;
	variant?: "success" | "error" | "neutral";
	polite?: boolean;
}

export function AccessibleFeedback({
	id,
	message,
	variant = "neutral",
	polite = true,
}: AccessibleFeedbackProps) {
	const className = [
		"admin-feedback",
		variant === "success" ? "admin-feedback--success" : "",
		variant === "error" ? "admin-feedback--error" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			id={id}
			className={message ? className : undefined}
			role={polite ? "status" : "alert"}
			aria-live={polite ? "polite" : "assertive"}
		>
			{message}
		</div>
	);
}
